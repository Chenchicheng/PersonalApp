import * as Application from 'expo-application';
import { Platform } from 'react-native';

// 获取设备信息
export const getDeviceInfo = () => {
  return {
    app_version: Application.nativeApplicationVersion,
    build_version: Application.nativeBuildVersion,
    device_id: Application.applicationId,
    platform: Platform.OS,
    platform_version: Platform.Version,
  };
}; 