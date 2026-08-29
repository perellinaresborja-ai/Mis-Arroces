const fs = require('fs');

let code = fs.readFileSync('src/components/domain/NotificationBell.tsx', 'utf8');

code = code.replace(
  /onClick=\{[^\}]+\}/,
  `onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen && unreadCount > 0) {
            setUnreadCount(0); // Optimistic clear
            import('@/app/actions/notifications').then(m => m.markAllNotificationsRead());
          }
        }}`
);

fs.writeFileSync('src/components/domain/NotificationBell.tsx', code);
console.log('Fixed NotificationBell');
