<template>
  <n-modal
    :show="show"
    title="Scan Barcode"
    preset="card"
    style="max-width: 520px"
    @update:show="(v: boolean) => emit('update:show', v)"
  >
    <div class="scanner">
      <video ref="videoRef" class="scanner-video" playsinline muted></video>
      <div class="scanner-frame"></div>
    </div>

    <n-alert v-if="error" type="warning" style="margin-top: 12px">
      {{ error }}
    </n-alert>
    <n-text v-else depth="3" style="display: block; margin-top: 8px; font-size: 12px">
      Arahkan kamera ke barcode. Pastikan izin kamera diizinkan browser.
    </n-text>

    <template #footer>
      <n-space justify="end">
        <n-button @click="emit('update:show', false)">Tutup</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "detected", value: string): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const error = ref("");

let stream: MediaStream | null = null;
let rafId: number | null = null;
let detector: any = null;

async function start() {
  error.value = "";
  detector = null;

  const Detector = (window as any).BarcodeDetector;
  if (!Detector) {
    error.value =
      "Browser ini tidak mendukung pemindaian barcode otomatis (BarcodeDetector). Silakan isi barcode secara manual.";
    return;
  }

  try {
    detector = new Detector();
  } catch (e) {
    console.error("BarcodeDetector init error", e);
    error.value = "Gagal menginisialisasi pemindai barcode.";
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    error.value = "Kamera tidak tersedia pada perangkat/browser ini.";
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
  } catch (e) {
    console.error("getUserMedia error", e);
    error.value =
      "Tidak dapat mengakses kamera. Periksa izin kamera pada browser.";
    return;
  }

  const video = videoRef.value;
  if (!video) return;
  video.srcObject = stream;
  await video.play().catch(() => {});
  scanLoop();
}

function scanLoop() {
  const tick = async () => {
    const video = videoRef.value;
    if (!video || !detector) return;
    try {
      const codes = await detector.detect(video);
      if (codes && codes.length > 0 && codes[0].rawValue) {
        emit("detected", String(codes[0].rawValue));
        emit("update:show", false);
        return;
      }
    } catch {
      /* abaikan error per-frame */
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function stop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  const video = videoRef.value;
  if (video) video.srcObject = null;
}

watch(
  () => props.show,
  async (visible) => {
    if (visible) {
      await nextTick();
      await start();
    } else {
      stop();
    }
  },
);

onBeforeUnmount(stop);
</script>

<style scoped>
.scanner {
  position: relative;
  width: 100%;
}

.scanner-video {
  width: 100%;
  max-height: 320px;
  border-radius: 12px;
  background: #000;
  object-fit: cover;
}

.scanner-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70%;
  height: 40%;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(20, 184, 166, 0.9);
  border-radius: 12px;
  pointer-events: none;
}
</style>
