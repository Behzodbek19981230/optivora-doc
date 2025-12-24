import Image from 'next/image'
export default function LogoIcon() {

  return (
   <Image
     src='/logo.svg'
     alt='Logo'
     width={50 }
     height={50}
   />
  )
}
