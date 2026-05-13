'use client'

import { useCurrentUserImage } from '@/hooks/use-current-user-image'
import { useCurrentUserName } from '@/hooks/use-current-user-name'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { cn } from '../utils/supabase/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type AvatarRadius = 'none' | 'sm' | 'md' | 'lg' | 'full'

interface CurrentUserAvatarProps {
  size?: AvatarSize
  radius?: AvatarRadius
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const radiusClasses: Record<AvatarRadius, string> = {
  none: 'rounded-none',
  sm:   'rounded-sm',
  md:   'rounded-md',
  lg:   'rounded-lg',
  full: 'rounded-full',
}

export const CurrentUserAvatar = ({
  size = 'md',
  radius = 'full',
  className,
}: CurrentUserAvatarProps) => {
  const profileImage = useCurrentUserImage()
  const name = useCurrentUserName()
  const initials = name
    ?.split(' ')
    ?.map((word) => word[0])
    ?.join('')
    ?.toUpperCase()

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        radiusClasses[radius],
        'overflow-hidden',
        className
      )}
    >
      {profileImage && (
        <AvatarImage
          src={profileImage}
          alt={initials}
          className={radiusClasses[radius]}
        />
      )}
      <AvatarFallback className={radiusClasses[radius]}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}