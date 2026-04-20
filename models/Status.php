<?php

class Status {

    private $conn;
    private $table = "status";

    public function __construct($db) {
        $this->conn = $db;
    }

    // LISTAR
    public function listar() {
        $sql = "SELECT id_status AS id, descricao, ordem FROM {$this->table} ORDER BY ordem ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // BUSCAR
    public function buscar($id) {
        $sql = "SELECT id_status AS id, descricao, ordem FROM {$this->table} WHERE id_status = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // CRIAR
    public function criar($descricao, $ordem) {
        $sql = "INSERT INTO {$this->table} (descricao, ordem) VALUES (:descricao, :ordem)";
        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ":descricao" => $descricao,
            ":ordem" => $ordem
        ]);
    }

    // ATUALIZAR
    public function atualizar($id, $descricao, $ordem) {
        $sql = "
            UPDATE {$this->table}
            SET descricao = :descricao,
                ordem = :ordem
            WHERE id_status = :id
        ";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ":id" => $id,
            ":descricao" => $descricao,
            ":ordem" => $ordem
        ]);
    }

    // DELETAR
    public function deletar($id) {
        $sql = "DELETE FROM {$this->table} WHERE id_status = :id";
        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([":id" => $id]);
    }
}