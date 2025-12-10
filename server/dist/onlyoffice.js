import crypto from 'crypto';
export function getDocTypeByExt(ext) {
    const e = ext.replace('.', '').toLowerCase();
    if (['docx', 'doc', 'rtf', 'txt', 'odt', 'docm'].includes(e))
        return 'text';
    if (['xlsx', 'xls', 'csv', 'ods', 'xlsm'].includes(e))
        return 'spreadsheet';
    if (['pptx', 'ppt', 'odp'].includes(e))
        return 'presentation';
    return 'text';
}
export function buildOnlyOfficeConfig(opts) {
    const { id, name, ext, user, baseUrl } = opts;
    const fileUrl = `${baseUrl}/documents/file/${encodeURIComponent(id)}`;
    const docType = getDocTypeByExt(ext);
    const key = crypto.createHash('sha256').update(id).digest('hex');
    const callbackUrl = `${baseUrl}/documents/callback/${encodeURIComponent(id)}`;
    return {
        document: {
            fileType: ext.replace('.', ''),
            key,
            title: `${name}${ext}`,
            url: fileUrl
        },
        editorConfig: {
            callbackUrl,
            mode: 'edit',
            user: { id: user.id, name: user.name }
        },
        type: docType
    };
}
