'use client';

import React, { useState, useRef } from 'react';
import { FaFileAlt, FaImage, FaTimes, FaUpload } from 'react-icons/fa';

interface FileUploaderProps {
  onFileSelect: (files: File[]) => void;
  allowedTypes?: string[];
  maxSize?: number; // MB
  maxFiles?: number;
}

export default function FileUploader({
  onFileSelect,
  allowedTypes = ['image/*', 'application/pdf', '.txt', '.doc', '.docx', '.xls', '.xlsx'],
  maxSize = 5, // 默认最大5MB
  maxFiles = 3 // 默认最多3个文件
}: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newErrors: string[] = [];
    const newFiles: File[] = [];
    
    // 检查是否超过最大文件数
    if (selectedFiles.length + files.length > maxFiles) {
      newErrors.push(`最多只能上传${maxFiles}个文件`);
      return setErrors(newErrors);
    }
    
    // 验证每个文件
    Array.from(files).forEach(file => {
      // 检查文件大小
      if (file.size > maxSize * 1024 * 1024) {
        newErrors.push(`文件 ${file.name} 超过了最大大小 ${maxSize}MB`);
        return;
      }
      
      // 检查文件类型
      let isValidType = false;
      for (const type of allowedTypes) {
        if (type.startsWith('.')) {
          // 检查文件扩展名
          if (file.name.toLowerCase().endsWith(type.toLowerCase())) {
            isValidType = true;
            break;
          }
        } else if (type.includes('*')) {
          // 检查MIME类型前缀
          const typePrefix = type.split('*')[0];
          if (file.type.startsWith(typePrefix)) {
            isValidType = true;
            break;
          }
        } else if (file.type === type) {
          // 直接匹配MIME类型
          isValidType = true;
          break;
        }
      }
      
      if (!isValidType) {
        newErrors.push(`文件 ${file.name} 类型不支持`);
        return;
      }
      
      newFiles.push(file);
    });
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 更新已选文件列表
    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);
    onFileSelect(updatedFiles);
    setErrors([]);
    
    // 清空文件输入，以便再次选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = e.dataTransfer.files;
      const event = { target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FaImage className="text-blue-500" />;
    }
    return <FaFileAlt className="text-gray-500" />;
  };
  
  const getFilePreview = (file: File, index: number) => {
    return (
      <div key={index} className="flex items-center p-2 border rounded mb-2 bg-gray-50">
        <div className="mr-2">
          {getFileIcon(file)}
        </div>
        <div className="flex-1 truncate text-sm">
          {file.name}
        </div>
        <button
          type="button"
          onClick={() => removeFile(index)}
          className="p-1 ml-2 text-red-500 hover:text-red-700"
        >
          <FaTimes size={14} />
        </button>
      </div>
    );
  };
  
  return (
    <div className="w-full">
      {/* 文件拖放区域 */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <FaUpload className="mx-auto mb-2 text-gray-400" size={24} />
        <p className="text-sm text-gray-500">
          点击或拖放文件到此处上传
        </p>
        <p className="text-xs text-gray-400 mt-1">
          支持的文件类型: 图片, PDF, Word, Excel, 文本文件
        </p>
        <p className="text-xs text-gray-400">
          最大文件大小: {maxSize}MB, 最多{maxFiles}个文件
        </p>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileChange}
          accept={allowedTypes.join(',')}
        />
      </div>
      
      {/* 错误信息 */}
      {errors.length > 0 && (
        <div className="mt-2">
          {errors.map((error, index) => (
            <p key={index} className="text-red-500 text-xs">{error}</p>
          ))}
        </div>
      )}
      
      {/* 文件预览列表 */}
      {selectedFiles.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium mb-1">已选择的文件:</p>
          {selectedFiles.map((file, index) => getFilePreview(file, index))}
        </div>
      )}
    </div>
  );
} 