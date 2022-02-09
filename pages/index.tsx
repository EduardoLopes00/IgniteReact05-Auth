import type { NextPage } from 'next'
import {useContext, useState, FormEvent} from 'react'
import { AuthContext } from '../contexts/AuthContext';

import styles from '../styles/Home.module.css'



export default function Home() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password
    }

    await signIn(data);
  }
  
  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input placeholder="Email" type="text" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit" onSubmit={(event) => handleSubmit(event)}>Entrar</button>

    </form>
  )
}


