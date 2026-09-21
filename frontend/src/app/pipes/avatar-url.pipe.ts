import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';


@Pipe({ name: 'avatarUrl', standalone: true })
export class AvatarUrlPipe implements PipeTransform {
  transform(photoUrl: string | null | undefined): string {
    if (!photoUrl) return 'assets/avatar-defaut.svg';
    const base = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${base}${photoUrl}`;
  }
}
