import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FileDownloadData } from "@/types/types";

const FileDownloadNode = memo(({ data }: { data: FileDownloadData }) => {
  const { t } = useTranslation();
  const inputs = data.params?.inputs ?? [];
  const outputs = data.params?.outputs ?? [];

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-16 !bg-gray-500" />
      <div className="min-w-[280px] px-4 py-3 shadow-md rounded-md bg-white border-2 border-green-500">
        <div className="flex items-center mb-2">
          <div className="rounded-full w-10 h-10 flex items-center justify-center bg-green-100">
            <Download className="w-5 h-5 text-green-600" />
          </div>
          <div className="ml-2 flex-1">
            <div className="text-base font-bold">{data.name}</div>
            <div className="text-sm text-gray-500">{data.description}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-green-50 p-2 rounded">
          <div className="text-xs flex items-center gap-1">
            <span>{t('nodes.fileOps.downloadUrl')}: </span>
            <span className="font-mono font-semibold text-green-700">
              {data.url || t('nodes.fileOps.unspecified')}
            </span>
          </div>
          <div className="text-xs flex items-center gap-1">
            <span>{t('nodes.fileOps.savePath')}: </span>
            <span className="font-mono">{data.savePath || t('nodes.fileOps.unspecified')}</span>
          </div>
        </div>

        {(inputs.length > 0 || outputs.length > 0) && (
          <div className="mt-2 border-t border-green-200 pt-2">
            {inputs.length > 0 && (
              <div className="text-xs mb-1">
                <span className="text-green-600 font-semibold">{t('nodes.fileOps.inputs')}: </span>
                {inputs.map((param, i) => (
                  <span key={i} className="bg-green-100 px-1 py-0.5 rounded mr-1">
                    {param.name}
                  </span>
                ))}
              </div>
            )}
            {outputs.length > 0 && (
              <div className="text-xs">
                <span className="text-green-600 font-semibold">{t('nodes.fileOps.outputs')}: </span>
                {outputs.map((param, i) => (
                  <span key={i} className="bg-green-100 px-1 py-0.5 rounded mr-1">
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

FileDownloadNode.displayName = "FileDownloadNode";

export default FileDownloadNode;
