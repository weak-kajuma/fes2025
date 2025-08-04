import styles from "./style.module.css";

export default function Description() {

  const phrases = ["Los Flamencos National Reserve", "is a nature reserve located", "in the commune of San Ped"]

  return (
    <div className={styles.description}>
      {phrases.map((phrase, index) => (
        <AnimatedText key={index}>{phrase}</AnimatedText>
      ))}
    </div>
  )
}

function AnimatedText({ children }: { children: React.ReactNode }) {
  return (
    <p>{children}</p>
  )
}