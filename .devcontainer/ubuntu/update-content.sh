#! /bin/bash
NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo >> /home/vscode/.bashrc
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/vscode/.bashrc
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
source /home/vscode/.bashrc
brew install go-task/tap/go-task