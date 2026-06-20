        // Dark mode
        function toggleTheme() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            document.getElementById('themeToggleBtn').textContent = newTheme === 'dark' ? '☀️' : '🌙';
            localStorage.setItem('theme', newTheme);
        }

        (function() {
            const saved = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = saved || (prefersDark ? 'dark' : 'light');
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.addEventListener('DOMContentLoaded', () => {
                    document.getElementById('themeToggleBtn').textContent = '☀️';
                });
            }
        })();
