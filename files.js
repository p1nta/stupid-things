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
        const res = Absolute.split('/2500girls/')[1];
        names.push(`https://raw.githubusercontent.com/simmmis/2500girls/master/${res}`);
      } 
  });
}

ThroughDirectory('../2500girls');

console.log(names);

fs.writeFileSync('2500girls.json', JSON.stringify(names))