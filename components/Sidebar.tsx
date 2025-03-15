import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'AI文章生成', path: '/', icon: '🤖' },
  { name: 'Markdown编辑器', path: '/editor', icon: '📝' },
  { name: '微信预览', path: '/preview', icon: '👁️' },
  { name: '发布管理', path: '/publish', icon: '📤' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {pathname.includes('/ai-chat') ? '聊天历史' : '推文助手'}
        </h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              pathname === item.path ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}