USE appks;

CREATE TABLE Files (
         dataset_ID UUID PRIMARY KEY,
         ID INT,
         Name TEXT,
         Creation_date TIMESTAMP,
         Amount_of_bytes BIGINT,
         Blob_Data blob
       );