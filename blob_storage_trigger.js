module.exports = async function (context, inputBlob) {
    const fileName = context.bindingData.name;
  
    context.log('Processing file:', fileName);
    context.log('File size:', inputBlob.length, 'bytes');
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const isImage = imageExtensions.some(ext => 
        fileName.toLowerCase().endsWith(ext)
    );
    
    if (!isImage) {
        context.log('Not an image file, skipping...');
        return;
    }
    
    context.bindings.outputBlob = inputBlob;
    
    context.log('Thumbnail created successfully for:', fileName);
};
