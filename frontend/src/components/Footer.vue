<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-contact">
        <a class="footer-item" href="mailto:1920929599@qq.com">邮箱：1920929599@qq.com</a>
        <a class="footer-item" href="tel:13065520820">Tel：13065520820</a>
      </div>
      <div class="footer-sign">丫够燥的！</div>
      <p>© {{ year }} SelfIntro · 使用 Vue3 + Spring Boot 构建</p>
    </div>
  </footer>
</template>

<style scoped>
.footer-contact {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 10px 22px;
  margin-bottom: 14px;
  font-size: 0.9rem;
}
.footer-item {
  color: var(--text-soft);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s;
}
.footer-item:hover {
  color: var(--text);
}
.footer-sign {
  margin: 4px 0 14px;
  text-align: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.3rem;
  letter-spacing: 3px;
  background: linear-gradient(90deg, #7c3aed, #2563eb);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  cursor: pointer;
  transition: transform 0.2s;
}
.footer-sign:hover {
  animation: sign-flash 0.9s linear infinite;
  transform: scale(1.05);
}
@keyframes sign-flash {
  0%   { filter: hue-rotate(0deg)   brightness(1.2); }
  20%  { filter: hue-rotate(70deg)  brightness(1.5); }
  40%  { filter: hue-rotate(140deg) brightness(1.2); }
  60%  { filter: hue-rotate(210deg) brightness(1.6); }
  80%  { filter: hue-rotate(290deg) brightness(1.3); }
  100% { filter: hue-rotate(360deg) brightness(1.2); }
}
</style>
