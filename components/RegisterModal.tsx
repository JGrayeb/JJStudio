
import { useState } from 'react';
import { Mail, Lock, Phone, User, X } from 'lucide-react';

export default function RegisterModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    alias: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage('✅ Check your email to verify your account!');
        setFormData({ fullName: '', alias: '', email: '', password: '', phone: '' });
        setTimeout(() => onClose(), 3000);
      } else {
        setMessageType('error');
        setMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-950 border border-red-900 rounded-lg w-full max-w-md relative">
        {/* Header */}
        <div className="border-b border-red-900 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            <span className="text-white">JOIN</span> <span className="text-red-600">JJSTUDIO</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Full Name</label>
            <div className="flex items-center border border-gray-700 rounded bg-neutral-900 px-3 py-2">
              <User size={18} className="text-gray-500" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                required
                className="bg-transparent border-none outline-none flex-1 ml-2 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Alias */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Alias</label>
            <div className="flex items-center border border-gray-700 rounded bg-neutral-900 px-3 py-2">
              <User size={18} className="text-gray-500" />
              <input
                type="text"
                name="alias"
                value={formData.alias}
                onChange={handleChange}
                placeholder="Your alias/username"
                required
                className="bg-transparent border-none outline-none flex-1 ml-2 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Email</label>
            <div className="flex items-center border border-gray-700 rounded bg-neutral-900 px-3 py-2">
              <Mail size={18} className="text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className="bg-transparent border-none outline-none flex-1 ml-2 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Password</label>
            <div className="flex items-center border border-gray-700 rounded bg-neutral-900 px-3 py-2">
              <Lock size={18} className="text-gray-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="bg-transparent border-none outline-none flex-1 ml-2 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Phone Number</label>
            <div className="flex items-center border border-gray-700 rounded bg-neutral-900 px-3 py-2">
              <Phone size={18} className="text-gray-500" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+52 ..."
                required
                className="bg-transparent border-none outline-none flex-1 ml-2 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded text-sm ${
              messageType === 'success' 
                ? 'bg-green-900/30 text-green-300 border border-green-700'
                : 'bg-red-900/30 text-red-300 border border-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 rounded transition"
          >
            {loading ? 'Creating Account...' : 'REGISTER NOW — IT\'S FREE'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Confirm your email to start booking classes
          </p>
        </form>
      </div>
    </div>
  );
}
