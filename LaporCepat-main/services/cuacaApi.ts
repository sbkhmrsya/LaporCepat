import { API_TIMEOUT_MS } from '../config';
import { ApiError, PESAN_API } from './apiClient';
import { getSimulasi } from './laporanApi';
import type { CuacaInfo, CuacaResponse } from '../types/cuaca';
import type { IconName } from '../theme';

const CUACA_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=-7.9797&longitude=112.6304' +
  '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m' +
  '&timezone=Asia%2FBangkok';

function cekSimulasi(): void {
  const mode = getSimulasi();
  if (mode === 'offline') {
    const e = new ApiError(PESAN_API.offline, 0, { offline: true });
    e.offline = true;
    throw e;
  }
  if (mode === '404') throw new ApiError(PESAN_API.tidakTersedia, 404);
  if (mode === '500') throw new ApiError(PESAN_API.server, 500);
}

export function fetchCuacaRaw(): Promise<CuacaResponse> {
  return new Promise<CuacaResponse>((resolve, reject) => {
    cekSimulasi();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    fetch(CUACA_URL, { signal: controller.signal })
      .then((res) => {
        if (res.ok) {
          resolve(res.json() as Promise<CuacaResponse>);
        } else {
          reject(new ApiError(PESAN_API.tidakTersedia, res.status));
        }
      })
      .catch((e: any) => {
        if (e?.name === 'AbortError') {
          const err = new ApiError(PESAN_API.timeout, 0);
          err.kategori = 'timeout';
          reject(err);
          return;
        }
        const offline =
          e instanceof TypeError ||
          /network request failed|failed to fetch|networkerror|gagal terhubung/i.test(e?.message || '');
        if (offline) {
          const err = new ApiError(PESAN_API.offline, 0, { offline: true });
          err.offline = true;
          reject(err);
          return;
        }
        reject(new ApiError(e?.message || PESAN_API.gagal));
      })
      .finally(() => clearTimeout(timer));
  });
}

export function weatherCodeKeTeks(code: number): { teks: string; ikon: IconName } {
  if (code === 0) return { teks: 'Cerah', ikon: 'sunny' };
  if (code <= 2) return { teks: 'Cerah Berawan', ikon: 'partly-sunny' };
  if (code === 3) return { teks: 'Berawan', ikon: 'cloudy' };
  if (code === 45 || code === 48) return { teks: 'Berkabut', ikon: 'cloud-outline' };
  if (code >= 51 && code <= 57) return { teks: 'Gerimis', ikon: 'rainy-outline' };
  if (code >= 61 && code <= 67) return { teks: 'Hujan', ikon: 'rainy' };
  if (code >= 71 && code <= 77) return { teks: 'Salju', ikon: 'snow' };
  if (code >= 80 && code <= 82) return { teks: 'Hujan Lebat', ikon: 'thunderstorm' };
  if (code === 85 || code === 86) return { teks: 'Salju Lebat', ikon: 'snow' };
  if (code >= 95) return { teks: 'Badai Petir', ikon: 'thunderstorm' };
  return { teks: 'Tidak Diketahui', ikon: 'help-circle-outline' };
}

export async function getCuaca(): Promise<CuacaInfo> {
  const raw: CuacaResponse = await fetchCuacaRaw();
  const kode = weatherCodeKeTeks(raw.current.weather_code);
  return {
    suhu: raw.current.temperature_2m,
    kelembapan: raw.current.relative_humidity_2m,
    angin: raw.current.wind_speed_10m,
    kondisi: kode.teks,
    ikon: kode.ikon,
  };
}
