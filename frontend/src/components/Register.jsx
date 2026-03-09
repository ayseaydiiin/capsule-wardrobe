import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading, error: authError } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setError('');
      if (data.password !== data.passwordConfirm) {
        setError('Parolalar eşleşmiyor');
        return;
      }
      await registerUser(data.username, data.email, data.password, data.passwordConfirm);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Kayıt Olun
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Yeni bir hesap oluşturun
        </p>

        {(error || authError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error || authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Kullanıcı Adı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              {...register('username', {
                required: 'Kullanıcı adı gereklidir',
                minLength: {
                  value: 3,
                  message: 'Kullanıcı adı en az 3 karakter olmalıdır',
                },
                maxLength: {
                  value: 30,
                  message: 'Kullanıcı adı en fazla 30 karakter olmalıdır',
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="kullaniciadi"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Adresi
            </label>
            <input
              type="email"
              {...register('email', {
                required: 'Email adresi gereklidir',
                pattern: {
                  value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Geçerli bir email adresi girin',
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="ornek@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Parola */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parola
            </label>
            <input
              type="password"
              {...register('password', {
                required: 'Parola gereklidir',
                minLength: {
                  value: 6,
                  message: 'Parola en az 6 karakter olmalıdır',
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Parola Onayla */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parola Onayla
            </label>
            <input
              type="password"
              {...register('passwordConfirm', {
                required: 'Parola onayla gereklidir',
                validate: (value) =>
                  value === password || 'Parolalar eşleşmiyor',
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="••••••"
            />
            {errors.passwordConfirm && (
              <p className="text-red-500 text-sm mt-1">{errors.passwordConfirm.message}</p>
            )}
          </div>

          {/* Kayıt Butonu */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400"
          >
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Olun'}
          </button>
        </form>

        {/* Giriş Linki */}
        <p className="text-center text-gray-600 mt-6">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
            Giriş Yapın
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
