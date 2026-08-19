const fs = require('fs');
let code = fs.readFileSync('components/ThumbnailTab.tsx', 'utf8');

// I replaced:
// </div>
// </div>
// {/* Row 2: Text & Psychology */}
// With:
// </div>
// </div>
// {referenceImage && ...}
// </div>
// {/* Row 2: Text & Psychology */}

// So let's count divs.
code = code.replace(
  `            </div>
            </div>
            {referenceImage && (`,
  `            </div>
            {referenceImage && (`
);

fs.writeFileSync('components/ThumbnailTab.tsx', code);
