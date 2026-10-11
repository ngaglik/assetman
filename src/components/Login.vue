<template>
  <div class="login-root">

      <div class="brand-logo">
        <img :src="logoRspaw" alt="Logo RSPAW" />
      </div>
    <div class="login-wrapper">
      <n-card :bordered="false" class="login-card">
          <div class="login-brand">

            <h1 class="brand-title">
              Asset<strong>Man</strong>
            </h1>
            <p class="brand-subtitle">Asset Management System</p>
          </div>
        <n-h3 prefix="bar" style="margin-bottom: 4px">Masuk</n-h3>
        <small>Silakan login menggunakan akun SiJEMPOL</small>
        <n-divider />

        <n-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-placement="top"
          @keyup.enter="submit"
        >
          <n-form-item label="Username" path="username">
            <n-input
              v-model:value="form.username"
              placeholder="Masukkan username"
              :disabled="loading"
            />
          </n-form-item>

          <n-form-item label="Password" path="password">
            <n-input
              v-model:value="form.password"
              type="password"
              show-password-on="click"
              placeholder="Masukkan password"
              :disabled="loading"
            />
          </n-form-item>

          <n-space justify="end">
            <n-button
              type="primary"
              block
              :loading="loading"
              :disabled="loading"
              @click="submit"
            >
              Login
            </n-button>
          </n-space>
        </n-form>
      </n-card>

      <div class="lapor-link">
        <n-button text type="primary" @click="goLapor">
          Lapor Kerusakan
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { FormInst, useMessage } from "naive-ui";
import { useRouter } from "vue-router";
import { login } from "@/services/authService";
import logoRspaw from "../../assets/logo-rspaw.png";

const emit = defineEmits<{ (e: "login-success"): void }>();

const router = useRouter();

const goLapor = () => router.push("/lapor-kerusakan");

const formRef = ref<FormInst | null>(null);
const loading = ref(false);
const message = useMessage();

const form = ref({
  username: "",
  password: "",
});

const rules = {
  username: [
    { required: true, message: "Username wajib diisi", trigger: "blur" },
  ],
  password: [
    { required: true, message: "Password wajib diisi", trigger: "blur" },
  ],
};

const submit = async () => {
  if (loading.value) return;

  await formRef.value?.validate(async (errors) => {
    if (errors) return;

    loading.value = true;
    try {
      await login(form.value.username, form.value.password);
      message.success("Login berhasil!");
      emit("login-success");
    } catch (error) {
      console.error("Login error:", error);
      message.error((error as Error).message || "Terjadi kesalahan saat login");
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style scoped>
.login-root {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: linear-gradient(135deg, #e6fffb 0%, #f8fafc 100%);
}

.login-brand {
  text-align: center;
}

.brand-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}

.brand-logo img {
  height: 72px;
  width: auto;
  object-fit: contain;
}

.brand-title {
  font-size: 28px;
  font-weight: 400;
  color: #1e293b;
}

.brand-title strong {
  font-weight: 800;
  color: #0d9488;
}

.brand-subtitle {
  color: #64748b;
  font-size: 14px;
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
  padding: 0 16px;
}

.login-card {
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  border-radius: 16px;
}

.lapor-link {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
</style>
