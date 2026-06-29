const version = process.versions.node
const [major, minor] = version.split('.').map(Number)

const ok =
  major > 20 || (major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22

if (!ok) {
  console.error(`\nNode ${version} is too old for this project (need 20.19+ or 22.12+).`)
  console.error('\nUpgrade on WSL/Ubuntu without nvm (NodeSource):')
  console.error('  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -')
  console.error('  sudo apt install -y nodejs')
  console.error('  node -v\n')
  process.exit(1)
}
