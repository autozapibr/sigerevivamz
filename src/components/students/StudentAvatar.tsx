import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStudentPhotoSignedUrl } from '@/hooks/useStudents';

interface StudentAvatarProps {
  photoUrl?: string | null;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

const getInitials = (name: string) =>
  (name || '')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

/**
 * Avatar for a student that resolves the photo from the private `student-photos`
 * bucket to a temporary signed URL. Falls back to the initials while loading or
 * when there is no photo.
 */
export function StudentAvatar({ photoUrl, name, className, fallbackClassName }: StudentAvatarProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setUrl(null);
    getStudentPhotoSignedUrl(photoUrl ?? null)
      .then((resolved) => {
        if (active) setUrl(resolved);
      })
      .catch(() => {
        if (active) setUrl(null);
      });
    return () => {
      active = false;
    };
  }, [photoUrl]);

  return (
    <Avatar className={className}>
      {url && <AvatarImage src={url} alt={name} />}
      <AvatarFallback className={fallbackClassName}>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
