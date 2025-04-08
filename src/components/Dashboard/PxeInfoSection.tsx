import React from "react";

export function PxeInfoSection({ pxeData, pxeInfo, nodeInfo }: any) {
    return (
      <section className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-2xl font-semibold text-blue-700 mb-2">PXE / 노드 정보</h2>
          <ul className="text-sm text-gray-800 space-y-1">
            <li><strong>PXE 버전:</strong> {pxeInfo.pxeVersion}</li>
            <li><strong>네트워크 ID:</strong> {nodeInfo.l1ChainId}</li>
            <li><strong>Rollup 버전:</strong> {nodeInfo.rollupVersion}</li>
          </ul>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow border">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">블록 정보</h3>
            <p className="text-sm">현재 블록: {pxeData.blockNumber}, 증명된 블록: {pxeData.provenBlock}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">수수료 정보</h3>
            <p className="text-sm">Private Tx: {pxeData.baseFees?.privateTxFee}</p>
            <p className="text-sm">Public Tx: {pxeData.baseFees?.publicTxFee}</p>
          </div>
        </div>
      </section>
    );
  }
  