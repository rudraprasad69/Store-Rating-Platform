"use client"

interface WaveLoaderProps {
  className?: string
}

export function WaveLoader({ className = "" }: WaveLoaderProps) {
  return (
    <ul className={`wave-menu ${className}`}>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
  )
}
