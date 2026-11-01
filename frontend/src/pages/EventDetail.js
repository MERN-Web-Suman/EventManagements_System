// src/pages/EventDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { eventService, paymentService, feedbackService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FiCalendar, FiMapPin, FiUsers, FiStar, FiClock,
  FiTag, FiPlay, FiVideo, FiSend, FiX
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

// ─── OTP Modal ────────────────────────────────────────────────
const OTPModal = ({ email, onVerify, onClose, loading }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const refs = Array.from({ length: 6 }, () => React.createRef());

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const n = [...otp]; n[idx] = val.slice(-1); setOtp(n);
    if (val && idx < 5) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs[idx - 1].current?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-3xl p-8 w-full max-w-sm animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-display font-bold text-xl text-white">Payment Verification</h3>
            <p className="text-gray-400 text-sm mt-1">OTP sent to {email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><FiX size={18} /></button>
        </div>
        <div className="flex gap-2 justify-center my-6">
          {otp.map((d, i) => (
            <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1} value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-11 h-13 text-center text-lg font-bold rounded-xl border-2 bg-dark-800 text-white outline-none transition-all ${
                d ? 'border-primary-500' : 'border-white/10 focus:border-primary-500/60'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => onVerify(otp.join(''))}
          disabled={loading || otp.join('').length !== 6}
          className="w-full py-3 bg-orange-gradient text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? 'Processing...' : 'Confirm Payment →'}
        </button>
      </div>
    </div>
  );
};

// ─── Star Rating ──────────────────────────────────────────────
const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)}
        className={`text-2xl transition-transform hover:scale-110 ${s <= value ? 'text-yellow-400' : 'text-gray-600'}`}>
        ★
      </button>
    ))}
  </div>
);

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [bookingStep, setBookingStep] = useState('idle'); // idle | sending-otp | otp-modal | processing
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, fbRes] = await Promise.all([
          eventService.getEvent(id),
          feedbackService.getEventFeedback(id),
        ]);
        setEvent(evRes.data.data.event);
        setFeedbacks(fbRes.data.data.feedbacks);
      } catch { toast.error('Event not found'); navigate('/events'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, navigate]);

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleBookNow = async () => {
    if (!isAuthenticated) { toast.error('Please login to book'); navigate('/login'); return; }
    setBookingStep('sending-otp');
    try {
      await paymentService.sendPaymentOTP({ eventId: id });
      toast.success('OTP sent to your email!');
      setShowOtpModal(true);
      setBookingStep('otp-modal');
    } catch (err) {
      toast.error(err.message);
      setBookingStep('idle');
    }
  };

  const handleOtpVerify = async (otp) => {
    setBookingStep('processing');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Payment gateway failed to load');

      const { data: orderData } = await paymentService.createOrder({ eventId: id, quantity, otp });
      const order = orderData.data;

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'FESTIVA',
        description: event.title,
        order_id: order.orderId,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#ff6b35' },
        handler: async (response) => {
          try {
            const { data } = await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              eventId: id, quantity,
            });
            toast.success(`🎟️ Ticket confirmed! #${data.data.ticketNumber}`);
            setShowOtpModal(false);
            setBookingStep('idle');
            navigate('/my-bookings');
          } catch (err) { toast.error(err.message); setBookingStep('idle'); }
        },
        modal: { ondismiss: () => setBookingStep('idle') },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setShowOtpModal(false);
    } catch (err) {
      toast.error(err.message);
      setBookingStep('idle');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const { data } = await feedbackService.submitFeedback({ eventId: id, ...feedback });
      setFeedbacks([data.data.feedback, ...feedbacks]);
      setFeedback({ rating: 5, comment: '' });
      toast.success('Feedback submitted! 🙏');
    } catch (err) { toast.error(err.message); }
    finally { setSubmittingFeedback(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!event) return null;

  const availableSeats = event.totalSeats - event.bookedSeats;
  const isSoldOut = availableSeats <= 0;
  const totalPrice = event.price * quantity;

  return (
    <div className="page-enter min-h-screen pt-20 pb-16">
      {showOtpModal && (
        <OTPModal
          email={user?.email}
          onVerify={handleOtpVerify}
          onClose={() => { setShowOtpModal(false); setBookingStep('idle'); }}
          loading={bookingStep === 'processing'}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 lg:h-96 rounded-3xl overflow-hidden mb-8">
          {event.image?.url ? (
            <img src={event.image.url} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-600 flex items-center justify-center">
              <span className="text-8xl">🎉</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/30 to-transparent"></div>
          {event.video?.liveStream?.isLive && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold animate-pulse">
              <FiPlay size={14} /> LIVE NOW
            </div>
          )}
          <div className="absolute bottom-6 left-6">
            <span className="px-3 py-1 bg-primary-500/20 border border-primary-500/40 text-primary-400 rounded-full text-sm font-medium">
              {event.category}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-white leading-tight mb-3">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><FiCalendar size={14} className="text-primary-400" />
                  {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1.5"><FiClock size={14} className="text-primary-400" />{event.time}</span>
                <span className="flex items-center gap-1.5"><FiMapPin size={14} className="text-primary-400" />
                  {event.location.venue}, {event.location.city}
                </span>
                {event.totalReviews > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <FiStar size={14} /> {event.averageRating} ({event.totalReviews} reviews)
                  </span>
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h2 className="font-display font-bold text-xl text-white mb-3">About this Event</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 glass rounded-full text-xs text-gray-400">
                    <FiTag size={10} /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Live/Video */}
            {(event.video?.liveStream?.url || event.video?.recorded?.url) && (
              <div className="glass rounded-2xl p-6 space-y-3">
                <h2 className="font-display font-bold text-xl text-white mb-3">Event Media</h2>
                {event.video.liveStream?.url && (
                  <a href={event.video.liveStream.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all">
                    <FiPlay size={20} /> Watch Live Stream
                  </a>
                )}
                {event.video.recorded?.url && (
                  <a href={event.video.recorded.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-all">
                    <FiVideo size={20} /> Watch Recorded Video
                  </a>
                )}
              </div>
            )}

            {/* Feedback Section */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display font-bold text-xl text-white mb-5">Reviews ({feedbacks.length})</h2>

              {isAuthenticated && (
                <form onSubmit={handleFeedbackSubmit} className="mb-8 p-4 bg-dark-800 rounded-xl space-y-4">
                  <h3 className="font-semibold text-white text-sm">Leave a Review</h3>
                  <StarRating value={feedback.rating} onChange={(r) => setFeedback({ ...feedback, rating: r })} />
                  <textarea
                    value={feedback.comment} onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                    placeholder="Share your experience..." rows={3} required
                    className="w-full bg-dark-900 text-white placeholder-gray-600 rounded-xl p-3 text-sm border border-white/10 input-glow resize-none"
                  />
                  <button type="submit" disabled={submittingFeedback}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-gradient text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">
                    <FiSend size={14} /> {submittingFeedback ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              <div className="space-y-4">
                {feedbacks.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No reviews yet. Be the first!</p>
                ) : (
                  feedbacks.map((fb) => (
                    <div key={fb._id} className="p-4 bg-dark-800 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-gradient flex items-center justify-center text-white text-xs font-bold">
                            {fb.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-white">{fb.user?.name}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <span key={s} className={`text-sm ${s <= fb.rating ? 'text-yellow-400' : 'text-gray-700'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{fb.comment}</p>
                      <p className="text-gray-600 text-xs mt-2">{format(new Date(fb.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-display font-black gradient-text mb-1">
                  {event.price === 0 ? 'FREE' : `₹${event.price.toLocaleString()}`}
                </div>
                <p className="text-gray-400 text-sm">per ticket</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1.5"><FiUsers size={13} /> Available Seats</span>
                  <span className={`font-semibold ${isSoldOut ? 'text-red-400' : availableSeats < 20 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {isSoldOut ? 'Sold Out' : `${availableSeats} left`}
                  </span>
                </div>

                {!isSoldOut && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 glass rounded-xl text-white font-bold hover:bg-white/10 transition-all">−</button>
                      <span className="text-white font-bold text-lg w-8 text-center">{quantity}</span>
                      <button onClick={() => setQuantity(Math.min(availableSeats, 10, quantity + 1))}
                        className="w-9 h-9 glass rounded-xl text-white font-bold hover:bg-white/10 transition-all">+</button>
                    </div>
                  </div>
                )}

                {!isSoldOut && event.price > 0 && (
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-gray-400 text-sm">Total</span>
                    <span className="font-display font-bold text-xl text-white">₹{totalPrice.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleBookNow}
                disabled={isSoldOut || bookingStep !== 'idle'}
                className={`w-full py-3.5 font-bold rounded-xl text-sm transition-all duration-200 shadow-lg ${
                  isSoldOut
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-gradient text-white hover:opacity-90 active:scale-95 shadow-primary-500/25'
                }`}
              >
                {bookingStep === 'sending-otp' ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending OTP...
                  </span>
                ) : isSoldOut ? '🎫 Sold Out' : event.price === 0 ? '🎉 Register Free' : '🎟️ Book Now'}
              </button>

              {!isAuthenticated && (
                <p className="text-gray-500 text-xs text-center mt-3">
                  <button onClick={() => navigate('/login')} className="text-primary-400 hover:underline">Login</button> to book tickets
                </p>
              )}

              <div className="mt-4 space-y-2">
                {[
                  ['✅', 'Instant confirmation'],
                  ['📧', 'PDF ticket via email'],
                  ['🔒', 'Secure OTP payment'],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{icon}</span> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
