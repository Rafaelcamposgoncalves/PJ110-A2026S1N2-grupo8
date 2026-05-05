<?php
class Sistemaquilha {
    private $conn;
    private $table = "sistemaquilha";

    public function __construct($db) {
        $this->conn = $db;
    }

    /* ========================= LISTAR ========================= */
    public function listar($apenasAtivos = false) {
        $sql = " SELECT id_sistemaquilha, descricao, ativo FROM {$this->table} ";
        
        if ($apenasAtivos) {
            $sql .= " WHERE ativo = 1 ";
        }
        
        $sql .= " ORDER BY descricao ASC ";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /* ========================= BUSCAR ========================= */
    public function buscar($id) {
        $sql = " SELECT id_sistemaquilha, descricao, ativo FROM {$this->table} WHERE id_sistemaquilha = :id ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /* ========================= CRIAR ========================= */
    public function criar($descricao) {
        $sql = " INSERT INTO {$this->table} (descricao, ativo) VALUES (:descricao, 1) ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':descricao', $descricao);
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    /* ========================= ATUALIZAR ========================= */
    public function atualizar($id, $descricao) {
        $sql = " UPDATE {$this->table} SET descricao = :descricao WHERE id_sistemaquilha = :id ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':descricao', $descricao);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /* ========================= ATUALIZAR ATIVO ========================= */
    public function atualizarAtivo($id, $ativo) {
        $sql = " UPDATE {$this->table} SET ativo = :ativo WHERE id_sistemaquilha = :id ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':ativo', $ativo, PDO::PARAM_INT);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /* ========================= DELETAR ========================= */
    public function deletar($id) {
        // Mantido exatamente como o seu original que funcionava
        $sql = " DELETE FROM {$this->table} WHERE id_sistemaquilha = :id ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
