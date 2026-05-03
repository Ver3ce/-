import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, ArrowRight, Sparkles, Eye, EyeOff, AlertCircle, ServerOff, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

type Tab = "login" | "register";

export default function Login() {
  const [tab, setTab] = useState<Tab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // Check backend availability on mount
  useEffect(() => {
    fetch("/api/trpc/auth.me")
      .then((res) => {
        setApiOnline(res.headers.get("content-type")?.includes("json") ?? false);
      })
      .catch(() => setApiOnline(false));
  }, []);

  // Login form
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    name: "",
  });

  const handleError = (err: any) => {
    const msg = err?.message || "";
    if (msg.includes("DOCTYPE") || msg.includes("Unexpected token") || msg.includes("not valid JSON")) {
      setError("后端服务未运行 — 请本地启动后端（见下方说明）");
      setApiOnline(false);
    } else {
      setError(msg || "请求失败，请重试");
    }
  };

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    },
    onError: handleError,
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    },
    onError: handleError,
  });

  const { data: oauthUrl } = trpc.auth.url.useQuery({
    redirectUrl: `${window.location.origin}/dashboard`,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginForm.username || !loginForm.password) {
      setError("请填写用户名和密码");
      return;
    }
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!registerForm.username || !registerForm.password) {
      setError("请填写用户名和密码");
      return;
    }
    if (registerForm.password.length < 6) {
      setError("密码至少6位");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("两次密码不一致");
      return;
    }
    registerMutation.mutate({
      username: registerForm.username,
      password: registerForm.password,
      email: registerForm.email || undefined,
      name: registerForm.name || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">极光职途</h1>
          <p className="text-sm text-slate-500 mt-1">AI 驱动的职业加速引擎</p>
        </motion.div>

        {/* Backend Offline Warning */}
        <AnimatePresence>
          {apiOnline === false && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4"
            >
              <div className="flex items-start gap-3">
                <ServerOff size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-amber-300 font-medium">
                    后端服务未启动
                  </p>
                  <p className="text-xs text-amber-400/80 leading-relaxed">
                    当前为静态预览部署，注册/登录需要本地启动后端服务。
                  </p>
                  <div className="rounded-lg bg-black/30 p-3 font-mono text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <Terminal size={12} />
                      <span className="font-semibold">本地启动命令</span>
                    </div>
                    <p className="text-slate-400"># 1. 安装依赖</p>
                    <p>npm install</p>
                    <p className="text-slate-400 mt-1"># 2. 启动开发服务器</p>
                    <p>npm run dev</p>
                    <p className="text-slate-400 mt-1"># 3. 或启动生产服务器</p>
                    <p>npm run build && npm start</p>
                  </div>
                  <p className="text-xs text-amber-400/60">
                    数据库已配置好，启动后即可使用全部功能
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl glass-card p-8 border border-white/10"
        >
          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "login"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LogIn size={14} className="inline mr-1.5" />
              登录
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "register"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus size={14} className="inline mr-1.5" />
              注册
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2"
              >
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <AnimatePresence mode="wait">
            {tab === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">用户名或邮箱</label>
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="输入用户名"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">密码</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="输入密码"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loginMutation.isPending || apiOnline === false}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-5 rounded-xl font-medium disabled:opacity-40"
                >
                  {loginMutation.isPending ? "登录中..." : "登录"}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </motion.form>
            )}

            {/* Register Form */}
            {tab === "register" && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">用户名 *</label>
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    placeholder="3-50位字母数字"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">密码 *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="至少6位"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">确认密码 *</label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    placeholder="再次输入密码"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">昵称</label>
                    <input
                      type="text"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      placeholder="你的昵称"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">邮箱</label>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="example@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending || apiOnline === false}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-5 rounded-xl font-medium disabled:opacity-40"
                >
                  {registerMutation.isPending ? "注册中..." : "注册账号"}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-slate-500">或</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* OAuth */}
          <a
            href={oauthUrl?.url ?? "#"}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all text-sm disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            使用 Kimi 账号登录
          </a>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          登录即表示你同意我们的服务条款
        </p>
      </div>
    </div>
  );
}

