Telegram.WebApp.ready();
Telegram.WebApp.expand();

const mainButton = Telegram.WebApp.MainButton;
mainButton.setText("Поделиться результатом");
mainButton.onClick(() => {
  Telegram.WebApp.share({
    title: `Мой рекорд в 2048: ${score}!`,
    text: `Попробуй побить мой результат в 2048! 🎮`
  });
});
mainButton.show();

const user = Telegram.WebApp.initDataUnsafe.user;
document.getElementById('user').textContent = user?.username || `User${user?.id}`;