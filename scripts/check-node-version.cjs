const requiredMajor = 20;
const requiredMinor = 19;

const [major = 0, minor = 0] = process.versions.node
  .split('.')
  .map((value) => Number.parseInt(value, 10));

const isSupported =
  major > requiredMajor ||
  (major === requiredMajor && minor >= requiredMinor);

if (!isSupported) {
  console.error(
    `\n❌ Unsupported Node.js version: ${process.versions.node}\n` +
      `This project requires Node.js ${requiredMajor}.${requiredMinor}.0 or newer.\n` +
      `Please install an up-to-date Node.js LTS release and run npm install again.\n`
  );
  process.exit(1);
}
