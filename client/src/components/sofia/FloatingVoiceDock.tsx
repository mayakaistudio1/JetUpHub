/**
 * Deprecated: the continuous voice-mode session was removed in the
 * Sofia visual/UX refactor (task #187). Voice is now an opt-in TTS toggle on
 * Sofia's text replies, with a separate one-shot mic button in the composer.
 * There is no longer a "voice session" state to surface when the panel is
 * minimized, so this dock renders nothing.
 *
 * The component is kept as a no-op export so existing import sites compile
 * until they are cleaned up in the same pass.
 */
export default function FloatingVoiceDock(_props: { onExpand: () => void; mob: boolean }) {
  return null;
}
