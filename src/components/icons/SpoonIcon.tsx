export function SpoonIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className} 
      {...props}
    >
      <path d="M12 2C8.686 2 6 4.686 6 8c0 3.123 2.378 5.678 5.433 5.973V22h1.134V13.973C15.622 13.678 18 11.123 18 8c0-3.314-2.686-6-6-6z" />
    </svg>
  )
}
