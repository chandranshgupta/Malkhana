import React, { useState, useEffect } from 'react';
import './i18n';
import { useTranslation } from 'react-i18next';
import { Archive, Lock, ShieldCheck, FileText, Settings, Plus, Search, ScanLine, History, CheckCircle2, LogOut, Clock } from 'lucide-react';
import { BlueprintBackground } from './components/shared/BlueprintBackground';
import { EvidenceLog } from './components/EvidenceLog/EvidenceLog';
import { ActiveCustodyBoard } from './components/ActiveCustody/ActiveCustodyBoard';
import { SealedArchiveMatrix } from './components/SealedArchive/SealedArchiveMatrix';
import { ReportsDraftingTable } from './components/Reports/ReportsDraftingTable';
import { SystemSettings } from './components/SystemSettings/SystemSettings';
import { NewIngestionWorkflow } from './components/NewIngestion/NewIngestionWorkflow';
import { AuditTrail } from './components/Audit/AuditTrail';
import { SessionLogs } from './components/Audit/SessionLogs';
import { FormCC1PrintSheet } from './components/Reports/FormCC1PrintSheet';
import { 
  isVaultInitialized, 
  isVaultLocked, 
  unlockVault, 
  lockVault, 
  getAllUsers, 
  getSettings,
  authenticateSession,
  closeSession,
  reauthSession,
  isPinVaultEnabled,
  tryPinUnlock,
  updateOfficerLanguage
} from './api/invoke';

function VaultPinUnlockScreen({ onUnlockSuccess, onFallback }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setError("PIN MUST BE EXACTLY 6 DIGITS");
      return;
    }

    try {
      setError('');
      setLoading(true);
      const success = await tryPinUnlock(pin);
      if (success) {
        onUnlockSuccess();
      } else {
        setError("DECRYPTION FAILED: INVALID DEVICE PIN");
      }
    } catch (err) {
      console.error(err);
      setError("INVALID DEVICE PIN OR DECRYPTION ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-200 font-mono">
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `linear-gradient(to right, rgba(239, 68, 68, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(239, 68, 68, 0.15) 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="w-full max-w-md border-2 border-red-500 bg-slate-900/90 p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden">
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-red-500"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-red-500"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-red-500"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-red-500"></div>

        <div className="text-center mb-8 relative">
          <div className="inline-block border border-red-500/40 px-2 py-0.5 text-[10px] text-red-500 font-bold tracking-widest bg-slate-950 mb-3 animate-pulse">
            DEVICE QUICK PIN UNLOCK ENABLED
          </div>
          <h2 className="text-2xl font-black tracking-widest text-red-500">PIN_VAULT_UNLOCK</h2>
          <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">
            ENTER 6-DIGIT DEVICE PIN TO DECRYPT SECURE KEY
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase text-center">
              ENTER DEVICE PIN
            </label>
            <input
              type="password"
              maxLength={6}
              pattern="\d*"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="******"
              className="w-full bg-slate-950 border border-slate-700 p-3 text-2xl text-slate-200 placeholder-slate-800 outline-none focus:border-red-500 font-bold tracking-[1em] text-center"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 border border-red-500 bg-red-950/40 text-xs font-bold leading-relaxed text-red-400">
              [!] {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 font-bold tracking-widest transition-all ${
              loading 
                ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-500 shadow-[4px_4px_0px_rgba(239,68,68,0.3)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px]'
            }`}
          >
            {loading ? 'DECRYPTING...' : 'DECRYPT_VAULT_WITH_PIN'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onFallback}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-300 underline uppercase tracking-wider mt-4"
          >
            USE MASTER PASSWORD INSTEAD
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-800 text-[8px] text-slate-600 flex justify-between tracking-widest uppercase">
          <span>STATUS: SECURED</span>
          <span>CRYPTO: AES-GCM-256</span>
        </div>

      </div>
    </div>
  );
}

function VaultDecryptionScreen({ initialized, onUnlockSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    
    if (!initialized && password !== confirmPassword) {
      setError("MASTER PASSWORDS DO NOT MATCH");
      return;
    }

    try {
      setError('');
      setLoading(true);
      const success = await unlockVault(password);
      if (success) {
        onUnlockSuccess();
      } else {
        setError("AUTHENTICATION FAILED: VAULT LOCKED");
      }
    } catch (err) {
      console.error(err);
      if (typeof err === 'string' && err.includes("DECRYPTION_FAILED")) {
        setError("DECRYPTION KEY INVALID. VAULT REMAINS SECURELY ENCRYPTED.");
      } else {
        setError(String(err).toUpperCase());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-200 font-mono">
      {/* Blueprint background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `linear-gradient(to right, rgba(239, 68, 68, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(239, 68, 68, 0.15) 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }}></div>
      
      {/* Secure Auth container */}
      <div className="w-full max-w-md border-2 border-red-500 bg-slate-900/90 p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden">
        
        {/* Neon target crosshair lines */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-red-500"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-red-500"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-red-500"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-red-500"></div>

        <div className="text-center mb-8 relative">
          <div className="inline-block border border-red-500/40 px-2 py-0.5 text-[10px] text-red-500 font-bold tracking-widest bg-slate-950 mb-3 animate-pulse">
            {initialized ? "VAULT IS ENCRYPTED & LOCKED" : "NEW VAULT INITIALIZATION REQUIRED"}
          </div>
          <h2 className="text-2xl font-black tracking-widest text-red-500">MALKHANA_CRYPT_KEY</h2>
          <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">
            {initialized 
              ? "ENTER MASTER PASSWORD TO DECRYPT SQLCIPHER VAULT" 
              : "SET HARDENED MASTER PASSWORD TO GENERATE AES-256 DATABASE"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase">
              {initialized ? "VAULT MASTER PASSWORD" : "SET MASTER PASSWORD"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER SECURE MASTER KEY"
              className="w-full bg-slate-950 border border-slate-700 p-3 text-sm text-slate-200 placeholder-slate-800 outline-none focus:border-red-500 font-bold tracking-widest"
              disabled={loading}
              autoFocus
            />
          </div>

          {!initialized && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase">
                CONFIRM MASTER PASSWORD
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="RE-ENTER SECURE MASTER KEY"
                className="w-full bg-slate-950 border border-slate-700 p-3 text-sm text-slate-200 placeholder-slate-800 outline-none focus:border-red-500 font-bold tracking-widest"
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <div className="p-3 border border-red-500 bg-red-950/40 text-xs font-bold leading-relaxed text-red-400">
              [!] {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 font-bold tracking-widest transition-all ${
              loading 
                ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-500 shadow-[4px_4px_0px_rgba(239,68,68,0.3)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px]'
            }`}
          >
            {loading ? 'DECRYPTING...' : (initialized ? 'DECRYPT_VAULT' : 'GENERATE_SECURE_VAULT')}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-800 text-[8px] text-slate-600 flex justify-between tracking-widest uppercase">
          <span>STATUS: SECURED</span>
          <span>CRYPTO: PBKDF2 + AES-256</span>
        </div>

      </div>
    </div>
  );
}

function SessionReauthScreen({ currentUser, sessionId, onUnlockSuccess, onLogout }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setError("PIN MUST BE EXACTLY 6 DIGITS");
      return;
    }

    try {
      setError('');
      setLoading(true);
      const success = await reauthSession(sessionId, pin);
      if (success) {
        onUnlockSuccess();
      } else {
        setError("AUTHENTICATION FAILED: INVALID PIN");
      }
    } catch (err) {
      console.error(err);
      setError(String(err).toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 text-slate-200 font-mono">
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `linear-gradient(to right, rgba(14, 165, 233, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(14, 165, 233, 0.15) 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="w-full max-w-md border-2 border-[#0ea5e9] bg-slate-900/90 p-8 shadow-[0_0_50px_rgba(14,165,233,0.3)] relative overflow-hidden">
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#0ea5e9]"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#0ea5e9]"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#0ea5e9]"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#0ea5e9]"></div>

        <div className="text-center mb-8 relative">
          <div className="inline-block border border-[#0ea5e9]/40 px-2 py-0.5 text-[10px] text-[#0ea5e9] font-bold tracking-widest bg-slate-950 mb-3 animate-pulse">
            SESSION LOCKDOWN
          </div>
          <h2 className="text-2xl font-black tracking-widest text-[#0ea5e9]">QUICK_REAUTH</h2>
          <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">
            {currentUser?.full_name || currentUser?.username} ({currentUser?.designation || currentUser?.role})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase text-center">
              ENTER 6-DIGIT PIN TO RESUME
            </label>
            <input
              type="password"
              maxLength={6}
              pattern="\d*"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="******"
              className="w-full bg-slate-950 border border-slate-700 p-3 text-2xl text-slate-200 placeholder-slate-800 outline-none focus:border-[#0ea5e9] font-bold tracking-[1em] text-center"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 border border-red-500 bg-red-950/40 text-xs font-bold leading-relaxed text-red-400">
              [!] {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 font-bold tracking-widest transition-all ${
              loading 
                ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-[#0ea5e9] text-slate-950 hover:bg-[#38bdf8] shadow-[4px_4px_0px_rgba(14,165,233,0.3)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px]'
            }`}
          >
            {loading ? 'VERIFYING...' : 'RESUME_SESSION'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onLogout}
            className="w-full py-2 font-bold border border-red-500 text-red-500 hover:bg-red-950/20 text-xs tracking-widest transition-colors uppercase mt-4"
          >
            LOG OUT & CLOSE SESSION
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-800 text-[8px] text-slate-600 flex justify-between tracking-widest uppercase">
          <span>HOST: LOCAL_VAULT</span>
          <span>SESSION: LOCKED</span>
        </div>

      </div>
    </div>
  );
}

function LoginScreen({ onLoginSuccess }) {
  const [batchNo, setBatchNo] = useState('');
  const [pinOrPassword, setPinOrPassword] = useState('');
  const [error, setError] = useState('');
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(false);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutUntil) return;

    const checkLockout = () => {
      const remaining = new Date(lockoutUntil).getTime() - Date.now();
      if (remaining <= 0) {
        setLockoutUntil(null);
        setTimeLeft('');
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${mins}m ${secs}s`);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutUntil) return;
    if (!batchNo || !pinOrPassword) {
      setError("BATCH NUMBER AND PIN/PASSWORD ARE REQUIRED");
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await authenticateSession(batchNo, pinOrPassword, "VAULT-STATION-A");
      onLoginSuccess(response);
    } catch (err) {
      console.error("Login failed:", err);
      const errStr = String(err);
      if (errStr.startsWith('ACCOUNT_LOCKED|')) {
        const lockoutTime = errStr.split('|')[1];
        setLockoutUntil(lockoutTime);
        setError('ACCOUNT LOCKED OUT DUE TO EXCESSIVE FAILED ATTEMPTS');
      } else if (errStr.startsWith('INVALID_CREDENTIALS|')) {
        const attemptsLeft = errStr.split('|')[1];
        setError(`INVALID CREDENTIALS. ACCESS DENIED (${attemptsLeft} ATTEMPTS REMAINING)`);
      } else {
        setError(errStr.toUpperCase());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheatsheetClick = (u, p) => {
    setBatchNo(u);
    setPinOrPassword(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-200 font-mono">
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `linear-gradient(to right, rgba(14, 165, 233, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(14, 165, 233, 0.15) 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="w-full max-w-2xl border-2 border-[#0ea5e9] bg-slate-900/90 p-8 shadow-[0_0_50px_rgba(14,165,233,0.3)] relative overflow-hidden flex flex-col md:flex-row gap-8">
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#0ea5e9]"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#0ea5e9]"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#0ea5e9]"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#0ea5e9]"></div>

        <div className="flex-1">
          <div className="text-center mb-6 relative">
            <div className="inline-block border border-[#0ea5e9]/40 px-2 py-0.5 text-[10px] text-[#0ea5e9] font-bold tracking-widest bg-slate-950 mb-3">
              SECURE ACCESS PORTAL
            </div>
            <h2 className="text-2xl font-black tracking-widest text-[#0ea5e9]">MALKHANA_VAULT</h2>
            <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">Section 63 BSA Forensic Authentication</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 mb-1 tracking-widest uppercase">
                BATCH NUMBER / USERNAME
              </label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                disabled={loading || !!lockoutUntil}
                placeholder="ENTER BATCH NO / USERNAME"
                className="w-full bg-slate-950 border border-slate-700 p-3 text-xs text-slate-200 placeholder-slate-700 outline-none focus:border-[#0ea5e9] font-bold uppercase tracking-wider"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 mb-1 tracking-widest uppercase">
                PIN / CREDENTIAL PASSWORD
              </label>
              <input
                type="password"
                value={pinOrPassword}
                onChange={(e) => setPinOrPassword(e.target.value)}
                disabled={loading || !!lockoutUntil}
                placeholder="ENTER 6-DIGIT PIN OR PASSWORD"
                className="w-full bg-slate-950 border border-slate-700 p-3 text-xs text-slate-200 placeholder-slate-700 outline-none focus:border-[#0ea5e9] font-bold tracking-wider"
              />
            </div>

            {error && (
              <div className={`p-3 border text-[10px] font-bold leading-relaxed flex flex-col gap-1 ${lockoutUntil ? 'bg-red-950/40 border-red-500 text-red-400' : 'bg-amber-950/40 border-amber-500 text-amber-400'}`}>
                <div>[!] {error}</div>
                {lockoutUntil && (
                  <div className="text-xs font-black mt-1 text-center text-red-500 animate-pulse">
                    PORTAL LOCKED: {timeLeft}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!lockoutUntil}
              className={`w-full py-4 font-bold tracking-widest transition-all text-xs ${
                lockoutUntil 
                  ? 'bg-red-950 border border-red-500/50 text-red-500 cursor-not-allowed' 
                  : 'bg-[#0ea5e9] text-slate-950 hover:bg-[#38bdf8] shadow-[4px_4px_0px_rgba(14,165,233,0.3)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px]'
              }`}
            >
              {loading ? 'AUTHENTICATING...' : (lockoutUntil ? 'PORTAL_LOCKED_OUT' : 'AUTHENTICATE_VAULT')}
            </button>
          </form>
        </div>

        <div className="w-full md:w-56 border-t-2 md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
          <div>
            <div className="text-[9px] font-bold text-[#0ea5e9] tracking-widest uppercase mb-3 text-center">
              DEMO CREDENTIAL CHEATSHEET
            </div>
            <div className="space-y-2">
              {[
                { label: 'System Administrator', user: 'admin', pin: '111111', pass: 'admin' },
                { label: 'Malkhana In-charge', user: 'op_092', pin: '092092', pass: 'op_092' },
                { label: 'Sub-Inspector (IO)', user: 'io_rajesh', pin: '112233', pass: 'io_rajesh' },
                { label: 'Forensic Examiner', user: 'dr_vance', pin: '445566', pass: 'dr_vance' }
              ].map(c => (
                <button
                  key={c.user}
                  type="button"
                  onClick={() => handleCheatsheetClick(c.user, c.pin)}
                  className="w-full text-left p-2 border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-colors text-[9px] flex flex-col gap-0.5"
                >
                  <div className="font-bold text-[#0ea5e9]">{c.label}</div>
                  <div className="text-slate-400">Badge/User: <span className="text-slate-200 font-bold">{c.user}</span></div>
                  <div className="text-slate-400">PIN: <span className="text-slate-200 font-bold">{c.pin}</span> | Pass: <span className="text-slate-200 font-bold">{c.pass}</span></div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-850 text-[7px] text-slate-600 tracking-widest uppercase text-center">
            <span>TAP CREDENTIALS CARD TO AUTO-FILL</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function App() {
  const { t, i18n } = useTranslation();
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const otherLanguages = [
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
    { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشুর' },
    { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी' },
    { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'mni', name: 'Manipuri', nativeName: 'মণিপুরী' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
    { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
    { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
    { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'brx', name: 'Bodo', nativeName: "बर'" }
  ];

  const getLanguageNativeName = (code) => {
    const lang = otherLanguages.find(l => l.code === code);
    return lang ? lang.nativeName : code.toUpperCase();
  };

  const [currentView, setCurrentView] = useState('EVIDENCE_LOG');
  const [printEvidenceId, setPrintEvidenceId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCertEvidenceId, setActiveCertEvidenceId] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: 'op_092',
    username: 'op_092',
    full_name: 'OPERATOR_092',
    designation: 'Malkhana In-charge',
    role: 'MALKHANA_INCHARGE'
  });

  const [vaultInitialized, setVaultInitialized] = useState(false);
  const [vaultLocked, setVaultLocked] = useState(true);
  const [localLock, setLocalLock] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isReauthLocked, setIsReauthLocked] = useState(false);
  const [showPinUnlock, setShowPinUnlock] = useState(false);

  const setViewSafe = (view) => {
    if (view === 'SYSTEM_SETTINGS' && currentUser?.role !== 'ADMIN') {
      return;
    }
    if (view === 'NEW_INGESTION' && !['ADMIN', 'MALKHANA_INCHARGE', 'IO'].includes(currentUser?.role)) {
      return;
    }
    setCurrentView(view);
  };

  const fetchUsers = async () => {
    try {
      const list = await getAllUsers();
      setUsers(list);
      if (list.length > 0) {
        const defaultOp = list.find(u => u.id === 'op_092') || list[0];
        setCurrentUser(defaultOp);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const checkVaultState = async () => {
    try {
      const init = await isVaultInitialized();
      setVaultInitialized(init);
      if (init) {
        const locked = await isVaultLocked();
        setVaultLocked(locked);
        const pinEnabled = await isPinVaultEnabled();
        setShowPinUnlock(pinEnabled);
        if (!locked) {
          fetchUsers();
        }
      } else {
        setVaultLocked(true);
        setShowPinUnlock(false);
      }
    } catch (err) {
      console.error("Failed to check vault state:", err);
    }
  };

  // Initial check on mount
  useEffect(() => {
    checkVaultState();
  }, []);

  // Load local_lock setting and listen to settings changes
  useEffect(() => {
    if (vaultLocked) return;
    const fetchSettings = async () => {
      try {
        const settingsStr = await getSettings();
        const settings = JSON.parse(settingsStr);
        const lockSetting = settings.find(s => s.key === 'local_lock');
        if (lockSetting) {
          setLocalLock(lockSetting.value === 'true');
        }
      } catch (err) {
        console.error("Failed to fetch settings for auto-lock:", err);
      }
    };
    fetchSettings();

    const handleSettingChange = (e) => {
      setLocalLock(e.detail);
    };
    window.addEventListener('setting-local_lock-changed', handleSettingChange);
    return () => {
      window.removeEventListener('setting-local_lock-changed', handleSettingChange);
    };
  }, [vaultLocked]);

  // Idle Timer (3 mins reauth lock) & Blur Screen Lock
  useEffect(() => {
    if (!isLoggedIn || vaultLocked) return;

    let timeoutId;
    let blurTimeoutId;

    const triggerReauthLock = () => {
      setIsReauthLocked(true);
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        triggerReauthLock();
      }, 3 * 60 * 1000); // 3 minutes
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => {
      window.addEventListener(evt, resetTimer);
    });

    const handleWindowBlur = () => {
      if (localLock) {
        triggerReauthLock();
      } else {
        // Start a 3-minute background auto-lock timer when window is blurred
        if (blurTimeoutId) clearTimeout(blurTimeoutId);
        blurTimeoutId = setTimeout(() => {
          triggerReauthLock();
        }, 3 * 60 * 1000); // 3 minutes grace period
      }
    };

    const handleWindowFocus = () => {
      // Clear the background auto-lock timer when user focuses the window again
      if (blurTimeoutId) {
        clearTimeout(blurTimeoutId);
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (blurTimeoutId) clearTimeout(blurTimeoutId);
      activityEvents.forEach(evt => {
        window.removeEventListener(evt, resetTimer);
      });
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isLoggedIn, localLock, vaultLocked]);

  const handleLoginSuccess = (response) => {
    setSessionId(response.session_id);
    setCurrentUser(response.user);
    setIsLoggedIn(true);
    if (response.preferred_language) {
      i18n.changeLanguage(response.preferred_language);
    }
  };

  const handleLogout = async () => {
    try {
      if (sessionId) {
        try {
          await closeSession(sessionId);
        } catch (e) {
          console.error("Failed to close session:", e);
        }
      }
      await lockVault();
      setVaultLocked(true);
      setIsLoggedIn(false);
      setSessionId(null);
      setIsReauthLocked(false);
    } catch (err) {
      console.error("Failed to lock vault during logout:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-mono text-slate-800 flex overflow-hidden selection:bg-slate-300 selection:text-slate-900">
      <BlueprintBackground />

      {/* Render vault decryption screen if vault is locked */}
      {vaultLocked ? (
        showPinUnlock ? (
          <VaultPinUnlockScreen 
            onUnlockSuccess={checkVaultState} 
            onFallback={() => setShowPinUnlock(false)} 
          />
        ) : (
          <VaultDecryptionScreen 
            initialized={vaultInitialized} 
            onUnlockSuccess={checkVaultState} 
          />
        )
      ) : !isLoggedIn ? (
        <LoginScreen users={users} onLoginSuccess={handleLoginSuccess} />
      ) : null}

      {/* Inactivity / Blur Lock overlay */}
      {isLoggedIn && isReauthLocked && (
        <SessionReauthScreen 
          currentUser={currentUser} 
          sessionId={sessionId} 
          onUnlockSuccess={() => setIsReauthLocked(false)} 
          onLogout={handleLogout} 
        />
      )}
      
      {/* Sidebar - z-10 index to allow modal z-stack overlays */}
      <div className="w-20 lg:w-64 border-r border-slate-400 bg-opacity-50 flex flex-col pt-6 pb-6 z-10 relative bg-[#f4f7f9] transition-all duration-300">
        <div className="px-3 lg:px-6 mb-8 flex flex-col gap-2 z-40 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-500 flex-shrink-0">
              <div className="text-slate-200 text-[10px] text-center leading-tight font-black">
                {currentUser.id.substring(0, 4).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0 hidden lg:block">
              <div className="font-bold text-xs truncate">{currentUser.full_name || currentUser.username}</div>
              <div className="text-[10px] text-slate-500 truncate">{currentUser.designation || currentUser.role}</div>
            </div>
            
            {/* Brutalist Logout Button */}
            <button 
              onClick={handleLogout} 
              title="Lock Vault Portal"
              className="p-1 border border-slate-400 bg-white hover:bg-slate-100 hover:text-red-600 transition-colors hidden lg:block"
            >
              <LogOut size={14} />
            </button>
          </div>
          {/* Collapsed view logout button */}
          <div className="lg:hidden flex justify-center mt-2">
            <button 
              onClick={handleLogout} 
              title="Lock Vault Portal"
              className="p-1 border border-slate-400 bg-white hover:bg-slate-100 hover:text-red-600 transition-colors w-10 flex justify-center"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-2 lg:px-4">
          <button onClick={() => setViewSafe('EVIDENCE_LOG')} className={`w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-3 font-bold text-sm transition-all border ${currentView === 'EVIDENCE_LOG' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <Archive size={16} /> <span className="hidden lg:inline">{t('EVIDENCE_LOG')}</span>
          </button>
          <button onClick={() => setViewSafe('ACTIVE_CUSTODY')} className={`w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-3 font-bold text-sm transition-all border ${currentView === 'ACTIVE_CUSTODY' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <Lock size={16} /> <span className="hidden lg:inline">{t('ACTIVE_CUSTODY')}</span>
          </button>
          <button onClick={() => setViewSafe('SEALED_ARCHIVE')} className={`w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-3 font-bold text-sm transition-all border ${currentView === 'SEALED_ARCHIVE' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <ShieldCheck size={16} /> <span className="hidden lg:inline">{t('SEALED_ARCHIVE')}</span>
          </button>
          <button onClick={() => setViewSafe('REPORTS')} className={`w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-3 font-bold text-sm transition-all border ${currentView === 'REPORTS' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <FileText size={16} /> <span className="hidden lg:inline">{t('REPORTS')}</span>
          </button>
          <button onClick={() => setViewSafe('AUDIT_TRAIL')} className={`w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-3 font-bold text-sm transition-all border ${currentView === 'AUDIT_TRAIL' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <History size={16} /> <span className="hidden lg:inline">{t('AUDIT_TRAIL')}</span>
          </button>
          <button onClick={() => setViewSafe('SESSION_LOGS')} className={`w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-3 font-bold text-sm transition-all border ${currentView === 'SESSION_LOGS' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'}`}>
            <Clock size={16} /> <span className="hidden lg:inline">{t('SESSION_LOGS', 'Session History')}</span>
          </button>
          {currentUser?.role === 'ADMIN' && (
            <button onClick={() => setViewSafe('SYSTEM_SETTINGS')} className={`w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-3 font-bold text-sm transition-all border ${currentView === 'SYSTEM_SETTINGS' ? 'bg-[#e2e8f0] border-slate-400 text-slate-800 shadow-[2px_2px_0px_rgba(100,116,139,0.2)]' : 'border-transparent text-slate-600 hover:bg-slate-200/50'} mt-4`}>
              <Settings size={16} /> <span className="hidden lg:inline">{t('SYSTEM_SETTINGS')}</span>
            </button>
          )}
        </nav>

        {['ADMIN', 'MALKHANA_INCHARGE', 'IO'].includes(currentUser?.role) && (
          <div className="px-2 lg:px-4 mt-auto">
            <button onClick={() => setViewSafe('NEW_INGESTION')} className={`w-full flex items-center justify-center gap-2 py-3 border font-bold text-sm transition-all ${currentView === 'NEW_INGESTION' ? 'border-slate-800 bg-slate-800 text-white shadow-[2px_2px_0px_rgba(100,116,139,0.5)]' : 'border-slate-500 bg-white hover:bg-slate-50 shadow-[2px_2px_0px_rgba(100,116,139,0.5)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]'}`}>
              <Plus size={16} /> <span className="hidden lg:inline">{t('NEW_INGESTION')}</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Main Panel - z-20 layout stack */}
      <main className="flex-1 flex flex-col relative z-20 h-screen overflow-hidden">
        <header className="border-b border-slate-400 py-4 px-8 flex items-center justify-between bg-[#f4f7f9] z-20 relative flex-shrink-0">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black tracking-widest text-slate-800">MALKHANA_VAULT</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Multilingual Selector */}
            <div className="flex items-center font-mono text-xs border border-slate-400 bg-white shadow-[2px_2px_0px_rgba(100,116,139,0.15)] relative mr-2">
              <button 
                onClick={() => {
                  i18n.changeLanguage('en');
                  setShowLangDropdown(false);
                  if (isLoggedIn && currentUser?.username) {
                    updateOfficerLanguage(currentUser.username, 'en').catch(console.error);
                  }
                }}
                className={`px-3 py-1.5 font-bold transition-colors ${i18n.language === 'en' ? 'bg-slate-200 text-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                English
              </button>
              <div className="w-[1px] h-4 bg-slate-400"></div>
              <div className="relative">
                <button 
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className={`px-3 py-1.5 font-bold flex items-center gap-1 text-slate-600 hover:bg-slate-100 ${i18n.language !== 'en' ? 'bg-slate-200 text-slate-800' : ''}`}
                >
                  {i18n.language === 'en' ? 'Others ⬇️' : `${getLanguageNativeName(i18n.language)} ⬇️`}
                </button>
                {showLangDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 max-h-64 overflow-y-auto border-2 border-slate-800 bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.15)] z-50 custom-scrollbar">
                    {otherLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setShowLangDropdown(false);
                          if (isLoggedIn && currentUser?.username) {
                            updateOfficerLanguage(currentUser.username, lang.code).catch(console.error);
                          }
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-b-0 ${i18n.language === lang.code ? 'bg-slate-100 text-slate-900' : 'text-slate-700'}`}
                      >
                        {lang.nativeName} ({lang.name})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Global Search - Hidden in Sealed Archive as it has its own target search */}
            {currentView !== 'SEALED_ARCHIVE' && (
              <div className="relative flex items-center border-b border-slate-400 pb-1 w-64">
                <Search size={14} className="text-slate-400 absolute left-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder')} 
                  className="bg-transparent border-none outline-none w-full pl-6 text-xs placeholder-slate-400 font-mono" 
                />
              </div>
            )}
            <button className="text-slate-600 hover:text-slate-800"><ScanLine size={18} /></button>
            <button onClick={() => setViewSafe('AUDIT_TRAIL')} className={`hover:text-slate-800 transition-colors ${currentView === 'AUDIT_TRAIL' ? 'text-[#0ea5e9]' : 'text-slate-600'}`} title="View Merkle Audit Trail">
              <History size={18} />
            </button>
          </div>
        </header>
        
        {/* View Switcher */}
        {currentView === 'EVIDENCE_LOG' && (
          <EvidenceLog 
            setCurrentView={setViewSafe} 
            currentUser={currentUser} 
            searchQuery={searchQuery} 
            onDraftCertificate={(id) => {
              setActiveCertEvidenceId(id);
              setViewSafe('REPORTS');
            }} 
          />
        )}
        {currentView === 'ACTIVE_CUSTODY' && <ActiveCustodyBoard currentUser={currentUser} />}
        {currentView === 'SEALED_ARCHIVE' && <SealedArchiveMatrix currentUser={currentUser} onPrintCC1={(id) => { setPrintEvidenceId(id); setViewSafe('PRINT_CC1'); }} />}
        {currentView === 'REPORTS' && (
          <ReportsDraftingTable 
            currentUser={currentUser} 
            initialEvidenceId={activeCertEvidenceId} 
            onClearInitial={() => setActiveCertEvidenceId(null)} 
          />
        )}
        {currentView === 'SYSTEM_SETTINGS' && <SystemSettings currentUser={currentUser} />}
        {currentView === 'NEW_INGESTION' && <NewIngestionWorkflow setCurrentView={setViewSafe} currentUser={currentUser} />}
        {currentView === 'AUDIT_TRAIL' && <AuditTrail onBack={() => setViewSafe('EVIDENCE_LOG')} />}
        {currentView === 'SESSION_LOGS' && (
          <SessionLogs 
            sessionId={sessionId} 
            currentUser={currentUser} 
            onRefreshSessionState={checkVaultState} 
          />
        )}
        {currentView === 'PRINT_CC1' && <FormCC1PrintSheet evidenceId={printEvidenceId} onBack={() => setViewSafe('SEALED_ARCHIVE')} />}

      </main>
    </div>
  );
}