const fs = require('fs');
const path = require('path');

const names = [];

const ext = [
  '.png',
  '.jpg',
  '.jpeg',
];

function ThroughDirectory(Directory) {
  fs.readdirSync(Directory).forEach(File => {
      const Absolute = path.join(Directory, File);

      if (fs.statSync(Absolute).isDirectory() && !Absolute.includes('.git')) {
        return ThroughDirectory(Absolute);
      } else if (ext.some((el) => File.includes(el))) {
        const res = Absolute.split('/Anime-Girls-Holding-Programming-Books/')[1];
        names.push(`https://raw.githubusercontent.com/cat-milk/Anime-Girls-Holding-Programming-Books/master/${res}`);
      } 
  });
}

ThroughDirectory('../Anime-Girls-Holding-Programming-Books');

console.log(names);

fs.writeFileSync('images.json', JSON.stringify(names))