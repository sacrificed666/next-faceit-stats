export default function Footer() {
  return (
    <footer className="border-t border-white/6 mt-12">
      <div className="max-w-400 mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
        <span className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Illia Movchko
        </span>
        <span className="text-gray-500 text-xs">Powered by FACEIT Data API</span>
      </div>
    </footer>
  );
}
