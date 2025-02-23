import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FileUploadData } from "@/types/types";

const FileUploadNode = memo(({ data }: { data: FileUploadData }) => {
  const { t } = useTranslation();
  const inputs = data.params?.inputs ?? [];
  const outputs = data.params?.outputs ?? [];

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-16 !bg-gray-500" />
      <div className="min-w-[280px] px-4 py-3 shadow-md rounded-md bg-white border-2 border-blue-500">
        <div className="flex items-center mb-2">
          <div className="rounded-full w-10 h-10 flex items-center justify-center bg-blue-100">
            <Upload className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-2 flex-1">
            <div className="text-base font-bold">{data.name}</div>
            <div className="text-sm text-gray-500">{data.description}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-blue-50 p-2 rounded">
          <div className="text-xs flex items-center gap-1">
            <span>{t('nodes.fileOps.uploadPath')}: </span>
            <span className="font-mono font-semibold text-blue-700">
              {data.path || t('nodes.fileOps.unspecified')}
            </span>
          </div>
          <div className="text-xs flex items-center gap-1">
            <span>{t('nodes.fileOps.fileType')}: </span>
            <span className="font-mono">{data.fileType || t('nodes.fileOps.allFiles')}</span>
          </div>
        </div>

        {(inputs.length > 0 || outputs.length > 0) && (
          <div className="mt-2 border-t border-blue-200 pt-2">
            {inputs.length > 0 && (
              <div className="text-xs mb-1">
                <span className="text-blue-600 font-semibold">{t('nodes.fileOps.inputs')}: </span>
                {inputs.map((param, i) => (
                  <span key={i} className="bg-blue-100 px-1 py-0.5 rounded mr-1">
                    {param.name}
                  </span>
                ))}
              </div>
            )}
            {outputs.length > 0 && (
              <div className="text-xs">
                <span className="text-blue-600 font-semibold">{t('nodes.fileOps.outputs')}: </span>
                {outputs.map((param, i) => (
                  <span key={i} className="bg-blue-100 px-1 py-0.5 rounded mr-1">
                    {param.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-gray-500" />
    </>
  );
});

FileUploadNode.displayName = "FileUploadNode";

export default FileUploadNode;
