const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Custom config plugin to remove deprecated audio permissions
 *
 * This plugin removes audio-related permissions that are no longer needed:
 * - RECORD_AUDIO: Audio recording feature has been deprecated
 * - MODIFY_AUDIO_SETTINGS: No longer needed
 * - FOREGROUND_SERVICE_MEDIA_PLAYBACK: We don't play media in the background
 */
const withRemoveMediaPlaybackPermission = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Remove deprecated audio permissions
    if (androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = androidManifest.manifest['uses-permission'].filter(
        (permission) => {
          const name = permission.$?.['android:name'];
          return name !== 'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK' &&
                 name !== 'android.permission.RECORD_AUDIO' &&
                 name !== 'android.permission.MODIFY_AUDIO_SETTINGS' &&
                 name !== 'android.permission.READ_MEDIA_VIDEO' &&
                 name !== 'android.permission.READ_MEDIA_AUDIO';
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
