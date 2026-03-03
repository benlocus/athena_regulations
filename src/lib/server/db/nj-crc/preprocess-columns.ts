/**
 * Preprocessor for NJ regulation PDF text extracted with `pdftotext -layout`.
 * The PDF is two-column; this script splits columns and produces clean
 * single-column text suitable for the section parser.
 *
 * Uses gap-based column detection: finds a run of 4+ spaces in the middle
 * of a line to split left and right columns.
 *
 * Usage: tsx preprocess-columns.ts <input-layout.txt> <output.txt>
 */
import { readFileSync, writeFileSync } from 'fs';

const MIN_GAP = 4; // Minimum consecutive spaces to count as a column gap
const MIN_LEFT_WIDTH = 40; // Left column must be at least this wide
const MAX_LEFT_WIDTH = 68; // Left column won't be wider than this

// Page header/footer patterns to remove
function isPageArtifactLine(line: string): boolean {
	const trimmed = line.trim();
	if (!trimmed) return false;
	// "30-3" page number alone or combined with Supp
	if (/^30-\d+$/.test(trimmed)) return true;
	if (/^Supp\.\s+\d+-\d+-\d+$/.test(trimmed)) return true;
	// Combined footer: "30-3                     Supp. 3-6-23"
	if (/^Supp\.\s+\d+-\d+-\d+\s+30-\d+$/.test(trimmed)) return true;
	if (/^30-\d+\s+Supp\.\s+\d+-\d+-\d+$/.test(trimmed)) return true;
	// Headers
	if (/^PERSONAL USE CANNABIS RULES$/.test(trimmed)) return true;
	if (/^TREASURY—GENERAL$/.test(trimmed)) return true;
	// Running section header (just the section number, no heading text)
	if (/^17:30-\d+\.\d+$/.test(trimmed)) return true;
	// Combined header: "PERSONAL USE CANNABIS RULES    17:30-X.Y" or reverse
	if (/^PERSONAL USE CANNABIS RULES\s+17:30-\d+\.\d+$/.test(trimmed)) return true;
	if (/^17:30-\d+\.\d+\s+TREASURY—GENERAL$/.test(trimmed)) return true;
	if (/^TREASURY—GENERAL\s+17:30-\d+\.\d+$/.test(trimmed)) return true;
	if (/^17:30-\d+\.\d+\s+PERSONAL USE CANNABIS RULES$/.test(trimmed)) return true;
	return false;
}

/**
 * Find the split point in a line. Returns the index where the gap starts,
 * or -1 if no column gap is found.
 */
function findColumnGap(line: string): { leftEnd: number; rightStart: number } | null {
	// First check: look for a section heading pattern (17:30-X.Y) in the right portion.
	// These sometimes have narrower gaps (3 spaces) due to long left-column text.
	// Use a lower threshold (10) since section headings are very distinctive.
	const sectionInRight = line.match(/(\s{2,})(17:30-\d+\.\d+\s+[A-Z])/);
	if (sectionInRight && sectionInRight.index !== undefined) {
		const gapStart = sectionInRight.index;
		const rightStart = sectionInRight.index + sectionInRight[1].length;
		if (gapStart >= 10) {
			return { leftEnd: gapStart, rightStart };
		}
	}

	// Standard gap detection: look for a run of MIN_GAP+ spaces
	let bestGapStart = -1;
	let bestGapEnd = -1;
	let bestGapSize = 0;

	let gapStart = -1;
	for (let i = MIN_LEFT_WIDTH; i < Math.min(line.length, MAX_LEFT_WIDTH + 15); i++) {
		if (line[i] === ' ') {
			if (gapStart === -1) gapStart = i;
		} else {
			if (gapStart !== -1) {
				const gapSize = i - gapStart;
				if (gapSize >= MIN_GAP && gapSize > bestGapSize) {
					bestGapStart = gapStart;
					bestGapEnd = i;
					bestGapSize = gapSize;
				}
			}
			gapStart = -1;
		}
	}
	// Check trailing gap
	if (gapStart !== -1) {
		const gapSize = Math.min(line.length, MAX_LEFT_WIDTH + 15) - gapStart;
		if (gapSize >= MIN_GAP && gapSize > bestGapSize) {
			bestGapStart = gapStart;
			bestGapEnd = line.length;
			// Only if there's content after the gap
			const rest = line.substring(gapStart).trim();
			if (!rest) return null; // No right column
		}
	}

	if (bestGapStart === -1) return null;

	return { leftEnd: bestGapStart, rightStart: bestGapEnd };
}

function processText(layoutText: string): string {
	// Split by form feed (page break) characters
	const pages = layoutText.split('\f');
	const allOutput: string[] = [];

	for (const page of pages) {
		const rawLines = page.split('\n');
		const leftLines: string[] = [];
		const rightLines: string[] = [];

		for (const line of rawLines) {
			// Skip full-line page artifacts
			if (isPageArtifactLine(line)) continue;

			if (line.trim() === '') {
				leftLines.push('');
				rightLines.push('');
				continue;
			}

			const gap = findColumnGap(line);
			if (gap) {
				const left = line.substring(0, gap.leftEnd).trimEnd();
				const right = line.substring(gap.rightStart);

				// Check if either part is a page artifact
				const leftIsArtifact = isPageArtifactLine(left);
				const rightIsArtifact = isPageArtifactLine(right);

				if (leftIsArtifact && rightIsArtifact) continue;

				leftLines.push(leftIsArtifact ? '' : left);
				rightLines.push(rightIsArtifact ? '' : right);
			} else {
				// Single column line (left only, or short line)
				leftLines.push(line.trimEnd());
				rightLines.push('');
			}
		}

		// Trim trailing empties
		while (leftLines.length > 0 && leftLines[leftLines.length - 1].trim() === '') leftLines.pop();
		while (
			rightLines.length > 0 &&
			rightLines[rightLines.length - 1].trim() === ''
		)
			rightLines.pop();

		// Output left column then right column
		if (leftLines.some((l) => l.trim())) {
			allOutput.push(...leftLines);
		}
		if (rightLines.some((l) => l.trim())) {
			allOutput.push(''); // separator
			allOutput.push(...rightLines);
		}
		allOutput.push(''); // page separator
	}

	return allOutput.join('\n');
}

// Main
const [inputFile, outputFile] = process.argv.slice(2);
if (!inputFile || !outputFile) {
	console.error('Usage: tsx preprocess-columns.ts <input-layout.txt> <output.txt>');
	process.exit(1);
}

const layoutText = readFileSync(inputFile, 'utf-8');
const cleaned = processText(layoutText);
writeFileSync(outputFile, cleaned, 'utf-8');

const lineCount = cleaned.split('\n').length;
console.log(`Preprocessed: ${lineCount} lines written to ${outputFile}`);
