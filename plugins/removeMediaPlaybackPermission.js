const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Custom config plugin to remove FOREGROUND_SERVICE_MEDIA_PLAYBACK permission
 *
 * This permission is added by expo-audio but we don't need it because:
 * - Our audio recording happens only in the foreground
 * - Our video playback is only in the foreground
 * - We don't play media in the background
 */
const withRemoveMediaPlaybackPermission = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Remove FOREGROUND_SERVICE_MEDIA_PLAYBACK permission
    if (androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = androidManifest.manifest['uses-permission'].filter(
        (permission) => {
          const name = permission.$?.['android:name'];
          return name !== 'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK';
        }
      );
    }

    // Remove mediaPlayback foregroundServiceType from services
    if (androidManifest.manifest.application?.[0]?.service) {
      androidManifest.manifest.application[0].service.forEach((service) => {
        const serviceType = service.$?.['android:foregroundServiceType'];
        if (serviceType === 'mediaPlayback') {
          delete service.$['android:foregroundServiceType'];
        }
      });
    }

    return config;
  });
};

module.exports = withRemoveMediaPlaybackPermission;
