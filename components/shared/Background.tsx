import Image from 'next/image'

export const Background = () => {
  return (
    <div className="absolute inset-0">
      <Image
        src="/background.svg"
        alt="Background pattern"
        fill
        className="object-cover"
        priority
      />
    </div>
  )
}
