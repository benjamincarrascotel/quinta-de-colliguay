const RULE_TIPS = {
    'type-empty': 'Use one of: feat, fix, docs, style, refactor, test, chore, perf, ci, revert.',
    'type-enum': 'Use one of: feat, fix, docs, style, refactor, test, chore, perf, ci, revert.',
    'type-case': 'Write the type in lowercase (e.g. feat, fix).',
    'scope-empty': 'Add a scope inside parentheses using kebab-case, e.g. machines-dashboard.',
    'scope-case': 'The scope must be kebab-case (lowercase, hyphen separated).',
    'subject-empty': 'Add a short description after ":".',
    'subject-case': 'Subjects must stay lowercase (no Start/Pascal/Upper case).',
    'subject-full-stop': 'Do not end the subject with a period.',
    'header-max-length': 'Keep the header at 100 characters or less.',
};

const LOCATION_HINTS = {
    'type-empty': 'Header (line 1). ',
    'type-enum': 'Header (line 1). ',
    'type-case': 'Header (line 1). ',
    'scope-empty': 'Header (line 1). ',
    'scope-case': 'Header (line 1). ',
    'subject-empty': 'Header (line 1). ',
    'subject-case': 'Header (line 1). ',
    'subject-full-stop': 'Header (line 1). ',
    'header-max-length': 'Header (line 1). ',
    'body-leading-blank': 'Body (starts on line 3). ',
    'body-empty': 'Body (starts on line 3). ',
    'body-max-length': 'Body (starts on line 3). ',
    'footer-leading-blank': 'Footer (after the body). ',
    'footer-empty': 'Footer (after the body). ',
};

const EXAMPLE_HEADER = 'feat(machines-dashboard): fix totals on the table';

function formatMessage(problem, index) {
    const baseMessage = problem?.message ?? 'Rule violated.';
    const tip = RULE_TIPS[problem?.name];
    const location = LOCATION_HINTS[problem?.name] ?? '';
    const parts = [`  ${index + 1}. ${location}${baseMessage}`];
    if (tip) {
        parts.push(`       Tip: ${tip}`);
    }
    return parts.join('\n');
}

function formatResult(result, helpUrl) {
    const lines = [];
    lines.push('Commitlint detected issues in your commit message.');
    lines.push('');
    if (result?.input) {
        lines.push('Analyzed message:');
        const normalized = result.input.replace(/\r\n/g, '\n').split('\n');
        normalized.forEach((line, idx) => {
            const prefix = idx + 1;
            lines.push(`  ${prefix}: ${line}`.trimEnd());
        });
    } else {
        lines.push('Analyzed message: (empty)');
    }
    lines.push('');
    if ((result?.errors?.length ?? 0) > 0 || (result?.warnings?.length ?? 0) > 0) {
        lines.push('Problems found:');
        const problems = [...(result.errors || []), ...(result.warnings || [])];
        problems.forEach((problem, idx) => {
            lines.push(formatMessage(problem, idx));
        });
    } else {
        lines.push('No problems detected.');
    }
    lines.push('');
    lines.push('Expected structure:');
    lines.push('  type(scope): subject');
    lines.push('Valid example:');
    lines.push(`  ${EXAMPLE_HEADER}`);
    if (helpUrl) {
        lines.push('');
        lines.push(`Help: ${helpUrl}`);
    }
    return lines.join('\n');
}

export default function format(report = {}, options = {}) {
    const { results = [] } = report;
    const { helpUrl } = options;
    const messages = results
        .filter((result) => (result?.errors?.length ?? 0) > 0 || (result?.warnings?.length ?? 0) > 0)
        .map((result) => formatResult(result, helpUrl));
    return messages.join('\n\n');
}
