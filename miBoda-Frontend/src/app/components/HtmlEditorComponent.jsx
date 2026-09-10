import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
    HtmlEditor, Toolbar, MediaResizing, ImageUpload, Item,
    TableContextMenu,
    TableResizing,
} from 'devextreme-react/html-editor';

const sizeValues = ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt'];
const fontValues = [
    'Arial', 'Courier New', 'Georgia', 'Impact',
    'Lucida Console', 'Tahoma', 'Times New Roman', 'Verdana'
];
const headerValues = [false, 1, 2, 3, 4, 5];

const fontSizeOptions = { inputAttr: { 'aria-label': 'Font size' } };
const fontFamilyOptions = { inputAttr: { 'aria-label': 'Font family' } };
const headerOptions = { inputAttr: { 'aria-label': 'Font family' } };

const HtmlEditorComponent = (props) => {
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);   
    const containerRef = useRef(null);
    const [editorInstance, setEditorInstance] = useState(null);
    const lastContentRef = useRef('');
    const selectionRef = useRef(null);

    // Procesar dataRowEditNew cuando llega
    useEffect(() => {
        if (props.dataRowEditNew) {
            const content = props.dataRowEditNew.descripcion || '';
            if (editorRef.current?.instance && content !== lastContentRef.current) {
                editorRef.current.instance.option('value', content);
                lastContentRef.current = content;
            }
        }
    }, [props.dataRowEditNew]);

    // Resto del código permanece igual...
    const blobToBase64 = useCallback((blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }, []);

    const handlePaste = useCallback(async (e) => {
        if (!editorInstance) return;

        const clipboardItems = e.clipboardData?.items || [];
        for (let i = 0; i < clipboardItems.length; i++) {
            if (clipboardItems[i].type.indexOf('image') === -1) continue;

            e.preventDefault();
            e.stopPropagation();

            try {
                const blob = clipboardItems[i].getAsFile();
                if (!blob) continue;

                const base64 = await blobToBase64(blob);
                editorInstance.focus();

                const selection = editorInstance.getSelection();
                const insertPosition = selection ? selection.index : editorInstance.getLength();

                editorInstance.insertEmbed(insertPosition, "extendedImage", {
                    src: base64,
                    alt: 'Imagen pegada',
                    style: 'max-width: 100%; height: auto;'
                });
            } catch (error) {
                console.error('Error al procesar imagen pegada:', error);
            }
            break;
        }
    }, [editorInstance, blobToBase64]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !editorInstance) return;

        container.addEventListener('paste', handlePaste, true);
        return () => container.removeEventListener('paste', handlePaste, true);
    }, [editorInstance, handlePaste]);

    const handleSelectionChange = useCallback(() => {
        if (editorInstance) {
            selectionRef.current = editorInstance.getSelection();
        }
    }, [editorInstance]);

    const handleImageUpload = useCallback(async (file) => {
        if (!file || !editorRef.current?.instance) return;

        try {
            const base64 = await blobToBase64(file);
            const editor = editorRef.current.instance;

            editor.focus();

            const selection = selectionRef.current || editor.getSelection();
            const insertPosition = selection ? selection.index : editor.getLength();

            editor.insertEmbed(insertPosition, "extendedImage", {
                src: base64,
                alt: file.name || 'Imagen subida',
                style: 'max-width: 100%; height: auto;'
            });
        } catch (error) {
            console.error('Error al procesar imagen:', error);
            alert(`Error al cargar imagen: ${error.message}`);
        }
    }, [blobToBase64]);

    const handleFileChange = useCallback((e) => {
        if (e.target.files?.length) {
            handleImageUpload(e.target.files[0]);
            e.target.value = '';
        }
    }, [handleImageUpload]);

    const customToolbarButton = useMemo(() => ({
        widget: 'dxButton',
        options: {
            icon: 'image',
            onClick: () => fileInputRef.current?.click()
        }
    }), []);

    const handleValueChange = useCallback((e) => {
        const currentContent = e.value;
        if (currentContent !== lastContentRef.current) {
            lastContentRef.current = currentContent;
            props.onValueChanged?.(currentContent);
        }
    }, [props.onValueChanged]);

    useEffect(() => {
        if (editorRef.current?.instance) {
            const editor = editorRef.current.instance;
            setEditorInstance(editor);
            editor.option('value', lastContentRef.current);

            editor.on('selectionChange', handleSelectionChange);

            return () => {
                editor.off('selectionChange', handleSelectionChange);
            };
        }
    }, []);

    useEffect(() => {
        if (props.registerEditorMethods) {
            props.registerEditorMethods({
                getEditorContent: () => editorRef.current?.instance?.option('value') || lastContentRef.current,
                getRawContent: () => editorRef.current?.instance?.option('value') || '',
                clearContent: () => {
                    if (editorRef.current?.instance) {
                        editorRef.current.instance.option('value', '');
                        lastContentRef.current = '';
                    }
                },
                setContent: (content) => {
                    if (editorRef.current?.instance) {
                        editorRef.current.instance.option('value', content);
                        lastContentRef.current = content;
                    }
                }
            });
        }
    }, [props.registerEditorMethods]);

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <HtmlEditor
                ref={editorRef}
                height="725px"
                onValueChanged={handleValueChange}
                onInitialized={(e) => {
                    e.component.option('value', lastContentRef.current);
                    e.component.on('selectionChange', handleSelectionChange);
                }}
            >
                <MediaResizing enabled={true} />
                <ImageUpload tabs={["file"]} fileUploadMode="base64" />
                <TableContextMenu enabled={true} />
                <TableResizing enabled={true} />
                <Toolbar multiline={true}>
                    <Item name="undo" />
                    <Item name="redo" />
                    <Item name="separator" />

                    <Item name="size" acceptedValues={sizeValues} options={fontSizeOptions} />
                    <Item name="font" acceptedValues={fontValues} options={fontFamilyOptions} />
                    <Item name="separator" />
                    <Item name="bold" />
                    <Item name="italic" />
                    <Item name="strike" />
                    <Item name="underline" />
                    <Item name="separator" />
                    <Item name="superscript" />
                    <Item name="subscript" />
                    <Item name="separator" />

                    <Item name="alignLeft" />
                    <Item name="alignCenter" />
                    <Item name="alignRight" />
                    <Item name="alignJustify" />
                    <Item name="separator" />

                    <Item name="orderedList" />
                    <Item name="bulletList" />
                    <Item name="separator" />

                    <Item name="header" acceptedValues={headerValues} options={headerOptions} />
                    <Item name="separator" />

                    <Item name="color" />
                    <Item name="background" />
                    <Item name="separator" />

                    <Item name="link" />
                    {/* <Item name="image" /> */}
                    <Item name="separator" />

                    <Item name="insertTable" />
                    <Item name="tableProperties" />
                    <Item name="tableCellProperties" />
                    <Item name="deleteTable" />
                    <Item name="separator" />

                    <Item name="insertRowAbove" />
                    <Item name="insertRowBelow" />
                    <Item name="insertColumnLeft" />
                    <Item name="insertColumnRight" />
                    <Item name="separator" />
                    <Item name="deleteRow" />
                    <Item name="deleteColumn" />
                    <Item name="separator" />

                    <Item name="codeBlock" />
                    <Item name="blockquote" />
                    <Item name="separator" />

                    <Item widget="dxButton" options={customToolbarButton.options} />
                </Toolbar>
            </HtmlEditor>
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </div>
    );
};

export default HtmlEditorComponent;