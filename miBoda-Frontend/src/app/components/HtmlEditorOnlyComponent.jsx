import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { HtmlEditor, Toolbar, MediaResizing, ImageUpload, Item } from 'devextreme-react/html-editor';

const sizeValues = ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt'];
const fontValues = ['Arial', 'Courier New', 'Georgia', 'Impact', 'Lucida Console', 'Tahoma', 'Times New Roman', 'Verdana'];
const headerValues = [false, 1, 2, 3, 4, 5];

const fontSizeOptions = { inputAttr: { 'aria-label': 'Font size' } };
const fontFamilyOptions = { inputAttr: { 'aria-label': 'Font family' } };
const headerOptions = { inputAttr: { 'aria-label': 'Header' } };

const HtmlEditorOnlyComponent = (props) => {
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const containerRef = useRef(null);
    const [editorInstance, setEditorInstance] = useState(null);
    const contentRef = useRef('');

    // Initialize editor with content from props
    useEffect(() => {
        if (props.dataRowEditNew?.descripcion && editorRef.current?.instance) {
            const content = props.dataRowEditNew.descripcion;
            editorRef.current.instance.option('value', content);
            contentRef.current = content;
        }
    }, [props.dataRowEditNew]);

    // Handle editor value changes
    const handleValueChange = useCallback((e) => {
        if (!e.event) return;
        contentRef.current = e.value;
    }, []);

    // Initialize editor configuration
    const handleInitialized = useCallback((e) => {
        const editor = e.component;
        setEditorInstance(editor);
        editor.option('value', contentRef.current);

        // Configure image resizing
        editor.option('mediaResizing', {
            enabled: true,
            allowedTargets: ['image'],
        });

        // Configure image upload
        editor.option('imageUpload', {
            tabs: ['file'],
            fileUploadMode: 'base64',
        });

        // Listen for option changes to detect image resizing
        editor.on('optionChanged', (args) => {
            if (args.name === 'value') {
                contentRef.current = args.value; // Update contentRef when value changes
            }
        });

        return () => {
            editor.off('optionChanged'); // Cleanup event listener
        };
    }, []);

    // Convert blob to base64
    const blobToBase64 = useCallback((blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }, []);

    // Handle image paste
    const handlePaste = useCallback(
        async (e) => {
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

                    // Insert image with styles
                    editorInstance.insertEmbed(insertPosition, 'extendedImage', {
                        src: base64,
                        alt: 'Pasted image',
                        style: 'max-width: 100%; height: auto; resize: both; display: block;',
                    });

                    // Update content
                    contentRef.current = editorInstance.option('value');
                } catch (error) {
                    console.error('Error processing pasted image:', error);
                }
                break;
            }
        },
        [editorInstance, blobToBase64]
    );

    // Handle image upload
    const handleImageUpload = useCallback(
        async (file) => {
            if (!file || !editorRef.current?.instance) return;

            try {
                const base64 = await blobToBase64(file);
                const editor = editorRef.current.instance;

                editor.focus();

                const selection = editor.getSelection();
                const insertPosition = selection ? selection.index : editor.getLength();

                // Insert image with styles
                editor.insertEmbed(insertPosition, 'extendedImage', {
                    src: base64,
                    alt: file.name || 'Uploaded image',
                    style: 'max-width: 100%; height: auto; resize: both; display: block;',
                });

                // Update content
                contentRef.current = editor.option('value');
            } catch (error) {
                console.error('Error processing image:', error);
                alert(`Error uploading image: ${error.message}`);
            }
        },
        [blobToBase64]
    );

    // Handle file input change
    const handleFileChange = useCallback(
        (e) => {
            if (e.target.files?.length) {
                handleImageUpload(e.target.files[0]);
                e.target.value = ''; // Reset input
            }
        },
        [handleImageUpload]
    );

    // Custom toolbar button for image upload
    const customToolbarButton = useMemo(
        () => ({
            widget: 'dxButton',
            options: {
                icon: 'image',
                onClick: () => fileInputRef.current?.click(),
            },
        }),
        []
    );

    // Register editor methods
    useEffect(() => {
        if (props.registerEditorMethods) {
            props.registerEditorMethods({
                getEditorContent: () => editorRef.current?.instance?.option('value') || contentRef.current,
                getRawContent: () => editorRef.current?.instance?.option('value') || '',
                clearContent: () => {
                    if (editorRef.current?.instance) {
                        editorRef.current.instance.option('value', '');
                        contentRef.current = '';
                    }
                },
                setContent: (content) => {
                    if (editorRef.current?.instance) {
                        editorRef.current.instance.option('value', content);
                        contentRef.current = content;
                    }
                },
            });
        }
    }, [props.registerEditorMethods]);

    // Add paste event listener
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !editorInstance) return;

        container.addEventListener('paste', handlePaste, true);
        return () => container.removeEventListener('paste', handlePaste, true);
    }, [editorInstance, handlePaste]);

    // Handle image resize by forcing content update
    useEffect(() => {
        if (!editorInstance || !containerRef.current) return;

        const handleResize = () => {
            if (editorInstance) {
                // Force content update after resize
                const currentContent = editorInstance.option('value');
                contentRef.current = currentContent;
                editorInstance.option('value', currentContent); // Trigger value change
            }
        };

        // Add a mutation observer to detect changes in image attributes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.target.tagName === 'IMG') {
                    handleResize();
                }
            });
        });

        const editorElement = containerRef.current.querySelector('.dx-htmleditor-content');
        if (editorElement) {
            observer.observe(editorElement, {
                attributes: true,
                subtree: true,
                attributeFilter: ['style', 'width', 'height'],
            });
        }

        return () => {
            observer.disconnect();
        };
    }, [editorInstance]);

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <HtmlEditor
                ref={editorRef}
                height="725px"
                onValueChanged={handleValueChange}
                onInitialized={handleInitialized}
            >
                <MediaResizing enabled={true} allowedTargets={['image']} />
                <ImageUpload tabs={['file']} fileUploadMode="base64" />
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
                    <Item name="link" />
                    <Item {...customToolbarButton} />
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

export default HtmlEditorOnlyComponent;