export interface LocationInfo {
  latitude: number;
  longitude: number;
  address?: string;
}

export const getLocation = (): Promise<LocationInfo> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

// 簡易的な住所取得（実際のアプリでは逆ジオコーディングAPIを使用）
export const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    // このサンプルでは座標をそのまま表示
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Failed to get address:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}; 