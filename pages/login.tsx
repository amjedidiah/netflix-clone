import Navbar from "components/navbar"
import useLogin from "hooks/use-login"
import Head from "next/head"
import styles from "styles/login.module.scss"

export default function Login() {
  const {
    email,
    handleEmailChange,
    handleLogin,
    buttonIsDisabled,
    validationMessage,
    loading,
  } = useLogin()

  return (
    <div className={styles.container}>
      <Head>
        <title>Netflix | Login</title>
      </Head>
      <Navbar minimal />

      <main className={styles.main}>
        <form className={styles.wrapper} onSubmit={handleLogin}>
          <h1 className={styles.heading}>Login</h1>

          <input
            type="text"
            value={email}
            name="email"
            id="login-email"
            placeholder="Email address"
            className={styles.input}
            onChange={handleEmailChange}
          />
          {validationMessage && (
            <p className={styles["email-message"]}>{validationMessage}</p>
          )}

          <button className={styles.button} disabled={buttonIsDisabled}>
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </main>
    </div>
  )
}
