const fs = require('fs');
let code = fs.readFileSync('src/routes/rda.tsx', 'utf8');

code = code.replace(
  '<div className="flex items-center gap-2">',
  `<div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.location.reload()}
            className="hidden sm:flex bg-card mr-2"
          >
            <RefreshCw className="size-4" />
          </Button>`
);

fs.writeFileSync('src/routes/rda.tsx', code);
