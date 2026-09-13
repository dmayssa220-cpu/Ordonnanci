import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class StorageService {
  async set(cle: string, valeur: string): Promise<void> {
    await Preferences.set({ key: cle, value: valeur });
  }

  async get(cle: string): Promise<string | null> {
    const { value } = await Preferences.get({ key: cle });
    return value;
  }

  async remove(cle: string): Promise<void> {
    await Preferences.remove({ key: cle });
  }

  async clear(): Promise<void> {
    await Preferences.clear();
  }
}
