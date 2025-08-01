'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { useSettings } from './useSettings'

type SoundName = 'start' | 'stop' | 'notify'

interface SoundConfig {
  src: string
  volume?: number
}

const soundConfigs: Record<SoundName, SoundConfig> = {
  start: { src: '/sounds/start.wav', volume: 0.5 },
  stop: { src: '/sounds/stop.mp3', volume: 0.5 },
  notify: { src: '/sounds/notify.wav', volume: 0.3 }
}

export function useSound() {
  const { settings, isLoaded } = useSettings()
  const soundsRef = useRef<Record<SoundName, Howl | null>>({
    start: null,
    stop: null,
    notify: null
  })

  // Initialize sounds on client side only
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return

    Object.entries(soundConfigs).forEach(([name, config]) => {
      const soundName = name as SoundName
      
      if (!soundsRef.current[soundName]) {
        // Check if sound file exists before trying to load
        fetch(config.src, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              // Apply master volume to base volume
              const finalVolume = (config.volume || 0.5) * settings.masterVolume
              
              soundsRef.current[soundName] = new Howl({
                src: [config.src],
                volume: finalVolume,
                preload: true,
                onloaderror: (id, error) => {
                  console.warn(`Failed to load sound ${name}:`, error)
                }
              })
            } else {
              console.info(`Sound file ${config.src} not found - sounds disabled for ${name}`)
            }
          })
          .catch(() => {
            console.info(`Sound file ${config.src} not available - sounds disabled for ${name}`)
          })
      }
    })

    // Cleanup function - capture current sounds reference
    const currentSounds = soundsRef.current
    return () => {
      Object.values(currentSounds).forEach(sound => {
        if (sound) {
          sound.unload()
        }
      })
    }
  }, [isLoaded, settings.masterVolume])

  // Update volume when master volume changes
  useEffect(() => {
    if (!isLoaded) return

    Object.entries(soundConfigs).forEach(([name, config]) => {
      const soundName = name as SoundName
      const sound = soundsRef.current[soundName]
      
      if (sound) {
        const finalVolume = (config.volume || 0.5) * settings.masterVolume
        sound.volume(finalVolume)
      }
    })
  }, [settings.masterVolume, isLoaded])

  const playSound = useCallback(async (soundName: SoundName) => {
    if (typeof window === 'undefined' || !isLoaded) return

    // Check if this specific sound is enabled
    if (!settings.soundEnabled[soundName]) {
      return
    }

    const sound = soundsRef.current[soundName]
    
    if (sound) {
      try {
        // Check if sound is ready to play
        if (sound.state() === 'loaded') {
          sound.play()
        } else {
          // Wait for sound to load
          sound.once('load', () => {
            sound.play()
          })
        }
      } catch (error) {
        console.warn(`Failed to play sound ${soundName}:`, error)
      }
    }
  }, [settings.soundEnabled, isLoaded])

  return { playSound }
}