<?php
class Cor {
    private $conn;
    private $table = "cor";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function listar($apenasAtivos = false) {
        // 🔥 Adicionado 'ativo' e o filtro opcional
        $sql = " SELECT id_cor, descricao, ativo FROM {$this->table} ";
        if ($apenasAtivos) {
            $sql .= " WHERE ativo = 1 ";
        }
        $sql .= " ORDER BY descricao ASC ";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function buscar($id) {
        $sql = " SELECT id_cor, descricao, ativo FROM {$this->table} WHERE id_cor = :id ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function criar($descricao) {
        // Criar sempre como ativo = 1
        $sql = " INSERT INTO {$this->table} (descricao, ativo) VALUES (:descricao, 1) ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':descricao', $descricao);
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function atualizar($id, $descricao) {
        $sql = " UPDATE {$this->table} SET descricao = :descricao WHERE id_cor = :id ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':descricao', $descricao);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /* ========================= NOVO: ATUALIZAR STATUS ========================= */
    public function atualizarAtivo($id, $ativo) {
        $sql = " UPDATE {$this->table} SET ativo = :ativo WHERE id_cor = :id ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':ativo', $ativo, PDO::PARAM_INT);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function deletar($id) {
        $sql = " DELETE FROM {$this->table} WHERE id_cor = :id ";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
