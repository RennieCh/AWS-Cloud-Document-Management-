import { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import {
  FaTrash,
  FaDownload,
  FaSortAlphaDown,
  FaCalendarAlt,
} from "react-icons/fa";
import { useParams } from "react-router-dom";

export default function Dashboard() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const { userId } = useParams();

  const [showConfirm, setShowConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState<any>(null);
  const [filterType, setFilterType] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    type: "alpha" | "date" | null;
    direction: "asc" | "desc";
  }>({
    type: null,
    direction: "asc",
  });
  const fetchDocuments = async () => {
    try {
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();

      const response = await fetch(
        `https://p0hzjm73nl.execute-api.us-east-1.amazonaws.com/prod/documents`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      setDocuments(
        Array.isArray(data)
          ? data.filter(
              (doc: any) => doc.user_id === session.getIdToken().payload.sub
            )
          : []
      );
      setLoading(false);
      console.log("Docs:", data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [userId]);

  const handleDelete = (doc: any) => {
    setDocToDelete(doc);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();

      await fetch(
        "https://p0hzjm73nl.execute-api.us-east-1.amazonaws.com/prod/delete-document",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ document_id: docToDelete }),
        }
      );

      setShowConfirm(false);
      setDocuments((prev) =>
        prev.filter((doc) => doc.s3_key !== docToDelete.s3_key)
      );
      fetchDocuments();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const reader = new FileReader();

    reader.onload = async () => {
      const base64String = (reader.result as string).split(",")[1];

      try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();

        const payload = {
          fileName: selectedFile.name,
          fileContent: base64String,
        };

        const res = await fetch(
          "https://p0hzjm73nl.execute-api.us-east-1.amazonaws.com/prod/upload",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const resultText = await res.text();
        if (!res.ok)
          throw new Error(
            `Upload failed with status ${res.status}: ${resultText}`
          );
        const result = JSON.parse(resultText);

        if (
          result?.status === "success" ||
          result?.message?.includes("uploaded")
        ) {
          setUploadStatus("success");
          // Optimistically add the new document
          const now = Math.floor(Date.now() / 1000);
          setDocuments((prev) => [
            ...prev,
            {
              file_name: selectedFile.name,
              upload_time: now,
              user_id: session.getIdToken().payload.sub,
              s3_key: result?.key || selectedFile.name, // adjust based on API
            },
          ]);
          setSelectedFile(null);
          setTimeout(fetchDocuments, 3000);
        } else {
          setUploadStatus("error");
        }
      } catch (err: any) {
        console.error("Upload error:", err.message || err);
        setUploadStatus("error");
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleDownload = async (doc: any) => {
    try {
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();

      const response = await fetch(
        `https://p0hzjm73nl.execute-api.us-east-1.amazonaws.com/prod/presigned-url?key=${doc.s3_key}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { url } = await response.json();
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      a.click();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus("idle");
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setUploadStatus("idle");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const filteredDocs = [...documents]
    .filter((doc) => {
      if (!filterType || filterType === "all") return true;

      const fileName: string = doc.file_name || "";
      const extension = fileName.split(".").pop()?.toLowerCase();

      const knownTypes = [
        "pdf",
        "png",
        "doc",
        "docx",
        "jpg",
        "jpeg",
        "xlsx",
        "py",
        "md",
        "txt",
      ];

      if (filterType === "others") {
        return !knownTypes.includes(extension || "");
      }

      return extension === filterType;
    })
    .sort((a, b) => {
      if (!sortConfig.type) return 0;

      if (sortConfig.type === "alpha") {
        return sortConfig.direction === "asc"
          ? a.file_name.localeCompare(b.file_name)
          : b.file_name.localeCompare(a.file_name);
      }

      if (sortConfig.type === "date") {
        return sortConfig.direction === "asc"
          ? new Date(a.upload_time * 1000).getTime() -
              new Date(b.upload_time * 1000).getTime()
          : new Date(b.upload_time * 1000).getTime() -
              new Date(a.upload_time * 1000).getTime();
      }

      return 0;
    });

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 mb-4">
          <div
            className="border border-2 border-dashed rounded p-5 text-center"
            style={{ backgroundColor: "#f8f9fa", cursor: "pointer" }}
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
          >
            {!selectedFile && (
              <>
                <label
                  htmlFor="formFile"
                  className="btn btn-success px-4 py-2 fw-bold"
                >
                  Select documents to upload
                </label>
                <div className="mt-2 text-muted">or drag & drop</div>
              </>
            )}
            <input
              type="file"
              id="formFile"
              className="d-none"
              onChange={handleFileChange}
            />

            {selectedFile && (
              <div className="mt-3">
                <div className="mb-2">
                  Selected: <strong>{selectedFile.name}</strong>
                </div>
                {uploadStatus === "idle" && (
                  <div className="d-flex justify-content-center gap-2">
                    <button onClick={handleUpload} className="btn btn-primary">
                      Upload
                    </button>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="btn btn-outline-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {uploadStatus === "success" && (
                  <>
                    <div className="alert alert-success mt-2">
                      Uploaded successfully.
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="btn btn-success"
                    >
                      Upload More
                    </button>
                  </>
                )}
                {uploadStatus === "error" && (
                  <>
                    <div className="alert alert-danger mt-2">
                      Failed to upload.
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="btn btn-warning"
                    >
                      Try Again
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-10">
          <div className="d-flex flex-wrap mb-3 gap-2 align-items-center">
            <select
              className="form-select w-auto"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="png">PNG</option>
              <option value="doc">DOC</option>
              <option value="jpg">JPG</option>
              <option value="jpeg">JPEG</option>
              <option value="xlsx">XLSX</option>
              <option value="py">PY</option>
              <option value="md">MD</option>
              <option value="txt">TXT</option>
              <option value="others">Others</option>
            </select>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => {
                setSortConfig((prev) => ({
                  type: "alpha",
                  direction:
                    prev.type === "alpha" && prev.direction === "asc"
                      ? "desc"
                      : "asc",
                }));
              }}
            >
              <FaSortAlphaDown /> Sort A-Z
            </button>
            <button
              type="button"
              className="btn btn-info"
              onClick={() => {
                setSortConfig((prev) => ({
                  type: "date",
                  direction:
                    prev.type === "date" && prev.direction === "asc"
                      ? "desc"
                      : "asc",
                }));
              }}
            >
              <FaCalendarAlt /> Sort by Date
            </button>
          </div>

          {!loading && documents.length === 0 && (
            <div className="alert alert-warning" role="alert">
              No documents
            </div>
          )}

          <ul className="list-group">
            {filteredDocs.map((doc, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
              >
                <div className="mb-1">
                  <div>{doc.file_name}</div>
                  <small className="text-muted">
                    {new Date(doc.upload_time * 1000).toLocaleString()}
                  </small>
                </div>
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDownload(doc)}
                  >
                    <FaDownload /> Download
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(doc)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showConfirm && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete "{docToDelete?.file_name}"?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
